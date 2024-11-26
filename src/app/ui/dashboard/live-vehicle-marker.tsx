import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  forwardRef,
} from "react";
import ReactDOM from "react-dom/client";

import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarkerAnchorPoint,
  AdvancedMarkerProps,
  AdvancedMarker,
  Pin,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { searchVehicleByNumber } from "@/app/lib/vehicle-utils";
import { useSession } from "next-auth/react";
import { Vehicle } from "@/app/lib/types";
import Modal from "react-modal";
import CloseIcon from "@mui/icons-material/Close";
import TravelPath from "./travel-path";
import { Grafana } from "./grafana";


type GeoVehicle = {
  key: string;
  location: google.maps.LatLngLiteral;
  ignition: number;
  speed: number;
};

interface InfoWindowProps {
  ignition: number;
  position: google.maps.LatLng | google.maps.LatLngLiteral;
  speed: number;
  vehicleNumber: string;
  map?: google.maps.Map;
  anchor: google.maps.marker.AdvancedMarkerElement;
}

export const VehicleMarkers = (props: { vehicles: GeoVehicle[] }) => {
  const map = useMap();
  const [markers, setMarkers] = useState<{
    [key: string]: google.maps.marker.AdvancedMarkerElement;
  }>({});
  const [openMarkerKey, setOpenMarkerKey] = useState<string | null>(null);
  const [clicked, setClicked] = useState(false);

  const clusterer = useRef<MarkerClusterer | null>(null);
  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }
    if (clusterer.current) {
      clusterer.current.clearMarkers();
      clusterer.current.addMarkers(Object.values(markers));
    }
  }, [map, markers]);

  const setMarkerRef = (
    marker: google.maps.marker.AdvancedMarkerElement | null,
    key: string
  ) => {
    if (marker && markers[key]) return;
    if (!marker && !markers[key]) return;

    setMarkers((prev) => {
      if (marker) {
        return { ...prev, [key]: marker };
      } else {
        const newMarkers = { ...prev };
        delete newMarkers[key];
        return newMarkers;
      }
    });
  };

  const handleMarkerClick = (key: string) => {
    setOpenMarkerKey((prevKey) => (prevKey === key ? null : key)); // Toggle open/close
  };

  return (
    <>
      {props.vehicles.map((vehicle: GeoVehicle) => (
        <React.Fragment key={vehicle.key}>
          <AdvancedMarkerWithRef
            position={vehicle.location}
            ref={(marker) => setMarkerRef(marker, vehicle.key)}
            onClick={(marker) => {
              if (marker) {
                handleMarkerClick(vehicle.key);
              }
            }}
          >
            <div>
              <DirectionsCarIcon
                sx={{
                  color:
                    vehicle.ignition === 0
                      ? "#454141"
                      : vehicle.speed <= 40
                      ? "green"
                      : "red",
                }} // TODO remove speedlimit hardcoded
              />
            </div>
          </AdvancedMarkerWithRef>

          {openMarkerKey === vehicle.key && (
            <InfoWindow
              ignition={vehicle.ignition}
              position={vehicle.location}
              speed={vehicle.speed}
              vehicleNumber={`${vehicle.key}`}
              map={map!}
              anchor={markers[vehicle.key]}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
};

// InfoWindow component
export const InfoWindow: React.FC<InfoWindowProps> = ({
  ignition,
  position,
  speed,
  vehicleNumber,
  map,
  anchor,
}) => {
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const { data: session, status } = useSession();
  const orgId = session?.user?.orgId as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const fetchedVehicle = await searchVehicleByNumber(
          orgId,
          vehicleNumber
        );
        setVehicle(fetchedVehicle); // Update state with fetched vehicle
      } catch (error) {
        console.error("Error fetching vehicle:", error);
      }
    };

    fetchVehicle();
  }, [orgId, vehicleNumber]);

  useEffect(() => {
    if (!map || !anchor) return;

    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow({
        disableAutoPan: true,
        headerDisabled: true,
        pixelOffset: new google.maps.Size(0, -15),
      });
    }

    const InfoWindowContent: React.FC = () => {
      const getInsights = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent the event from bubbling to the outer container
        // console.log(`Button clicked for vehicle: ${vehicleNumber}`);
        setModalIsOpen(true);

        // const url = `/vehicle-details/${vehicleNumber}`; // Example: dynamic URL for the vehicle
        // window.open(url, '_blank');
      };

      return (
        <>
          <div
            style={{
              color: "black",
              fontFamily: "Arial, sans-serif",
              background:
                ignition === 0
                  ? "#d1d5db"
                  : speed <= 40
                  ? "#86efac"
                  : "#f87171", // TODO remove speedlimit hardcoded
              borderRadius: "8px",
              padding: "10px",
              boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
              {vehicleNumber}
            </div>
            <div>Position: {`lat: ${position.lat}, lng: ${position.lng}`}</div>
            <div>Speed: {speed}</div>
            <div>Ph: {vehicle?.primaryPhoneNumber}</div>
            <div>Owner: {vehicle?.owner}</div>
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800 transition"
              onClick={getInsights}
            >
              Get Insights {">"}
            </button>
          </div>
        </>
      );
    };

    const container = document.createElement("div");
    const root = ReactDOM.createRoot(container);
    root.render(<InfoWindowContent />);

    infoWindowRef.current.setContent(container);
    infoWindowRef.current.open(map, anchor);

    const handleContentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("button")) {
        infoWindowRef.current?.close();
      }
    };
    container.addEventListener("click", handleContentClick);

    return () => {
      root.unmount();
      infoWindowRef.current?.close();
    };
  }, [vehicle]);

  return (
    <>
      {/* <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Detail"
        ariaHideApp={false}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)", // Optional: Adjust overlay background color
          },
          content: {
            // You can leave content styles empty if using Tailwind classes
          },
        }}
      >
        <div className="absolute top-1 right-1 mr-2 mt-2">
          <button
            className="absolute top-1 right-1 -mr-3 -mt-3 z-30 text-black rounded-full w-5 h-5 flex items-center justify-center"
            onClick={() => setModalIsOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>
        <Grafana vehicleNumber={vehicleNumber} />
      </Modal> */}
      <Grafana show={modalIsOpen} onClose={() => setModalIsOpen(false)} vehicleNumbers={vehicleNumber} />
    </>
  );
  return null;
};

export const AdvancedMarkerWithRef = forwardRef<
  google.maps.marker.AdvancedMarkerElement,
  AdvancedMarkerProps
>((props, ref) => {
  const { children, ...advancedMarkerProps } = props;
  const [markerRef] = useAdvancedMarkerRef();

  // Use the passed ref or the internal marker ref
  const combinedRef = ref || markerRef;

  return (
    <AdvancedMarker ref={combinedRef} {...advancedMarkerProps}>
      {children}
    </AdvancedMarker>
  );
});
