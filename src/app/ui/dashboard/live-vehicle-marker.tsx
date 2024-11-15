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

type Vehicle = {
  key: string;
  location: google.maps.LatLngLiteral;
  ignition: number;
};

interface InfoWindowProps {
  ignition: number; // or the appropriate type
  position: google.maps.LatLng | google.maps.LatLngLiteral; // adjust based on your usage
  content: string; // or string, depending on your content
  map?: google.maps.Map; // adjust based on your usage
  anchor: google.maps.marker.AdvancedMarkerElement; // updated to AdvancedMarkerElement
}

export const VehicleMarkers = (props: { vehicles: Vehicle[] }) => {
  const map = useMap();
  const [markers, setMarkers] = useState<{
    [key: string]: google.maps.marker.AdvancedMarkerElement;
  }>({});
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

  return (
    <>
      {props.vehicles.map((vehicle: Vehicle) => (
        <React.Fragment key={vehicle.key}>
          <AdvancedMarkerWithRef
            position={vehicle.location}
            ref={(marker) => setMarkerRef(marker, vehicle.key)}
          >
            <div>
              <DirectionsCarIcon
                sx={{ color: vehicle.ignition === 1 ? "green" : "grey" }}
              />
            </div>
          </AdvancedMarkerWithRef>
          <InfoWindow
            ignition={vehicle.ignition}
            position={vehicle.location}
            content={`${vehicle.key}`}
            map={map!}
            anchor={markers[vehicle.key]}
          />
        </React.Fragment>
      ))}
    </>
  );
};

// InfoWindow component
const InfoWindow: React.FC<InfoWindowProps> = ({
  ignition,
  position,
  content,
  map,
  anchor,
}) => {
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow({
        disableAutoPan: true,
        headerDisabled: true,
        pixelOffset: new google.maps.Size(0, -15),
      });
    }

    const backgroundColorClass =
      ignition === 1 ? "bg-green-300" : "bg-gray-300";
    const styledContent = `
      <div class="font-sans ${backgroundColorClass} rounded shadow pt-0">
        <h8 class="text-xs font-bold text-gray-800">${content}</h8>
      </div>`;

    infoWindowRef.current.setContent(styledContent);
    infoWindowRef.current.open(map, anchor);

    return () => {
      infoWindowRef.current?.close();
    };
  }, [position, content, map, anchor]);
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
