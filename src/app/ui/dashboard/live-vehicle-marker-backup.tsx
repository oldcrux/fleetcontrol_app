import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  forwardRef,
} from "react";
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

type GeoVehicle = {
  key: string;
  location: google.maps.LatLngLiteral;
  ignition: number;
  speed: number;
};

interface InfoWindowProps {
  ignition: number;
  position: google.maps.LatLng | google.maps.LatLngLiteral;
  speed: number,
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
                sx={{ color: vehicle.ignition === 0 ? "#454141" : vehicle.speed <= 40 ? "green" : "red" }} // TODO remove speedlimit hardcoded
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
const InfoWindow: React.FC<InfoWindowProps> = ({
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
    if (!vehicle || !map || !anchor) return;

    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow({
        disableAutoPan: true,
        headerDisabled: false,
        pixelOffset: new google.maps.Size(0, -15),
      });
    }

    const backgroundColorClass =
      ignition === 0 ? "bg-gray-300" : speed <= 40 ? "bg-green-300" : "bg-red-400" ; // TODO remove speedlimit hardcoded
      const formattedPosition = `lat: ${position.lat}, lng: ${position.lng}`;
      const styledContent = `
      <div class="font-sans ${backgroundColorClass} rounded shadow pt-2 px-2">
        <div class="text-xs font-bold text-gray-800">${vehicleNumber}</div>
        <div class="text-xs font-bold text-gray-800">${formattedPosition}</div>
        <div class="text-xs font-bold text-gray-800">Speed: ${speed}</div>
        <div class="text-xs font-bold text-gray-800">Ph: ${vehicle?.primaryPhoneNumber}</div>
        <div class="text-xs font-bold text-gray-800">Owner: ${vehicle?.owner}</div>
      </div>`;

    infoWindowRef.current.setContent(styledContent);
    infoWindowRef.current.open(map, anchor);

    return () => {
      infoWindowRef.current?.close();
    };
  }, [vehicle]);
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
