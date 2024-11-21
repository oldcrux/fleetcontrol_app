import React, { useEffect, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Polyline,
  Marker,
} from "@react-google-maps/api";
import { fetchVehiclesTravelPath } from "@/app/lib/vehicle-utils";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;

interface LatLng {
  lat: number;
  lng: number;
}

interface TravelPathProps {
  vehicleNumber: string; // Assuming vehicleNumber is a string
}

const TravelPath: React.FC<TravelPathProps> = ({ vehicleNumber }) => {
  const [path, setPaths] = useState<LatLng[]>([]);

  useEffect(() => {
    const fetchGeofences = async () => {
      const latlngs = await fetchVehiclesTravelPath(vehicleNumber);
      //console.log(`travel-path:useEffect: lat/lng fetched: ${JSON.stringify(latlngs)}`);
      if (latlngs.length > 0) {
        const paths = latlngs.map((geofence: any) => {
          // Assuming latlng data is available from fetchVehiclesTravelPath
          return { lat: geofence.lat, lng: geofence.lng };
        });
        setPaths(paths);
        // console.log(`paths==`, paths);
      }
    };
    fetchGeofences().catch(console.error);
  }, [vehicleNumber]); // Ensure vehicleNumber triggers re-fetching

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: API_KEY!,
  });

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const start = path[0];
  const end = path[path.length - 1];
  const center = { lat: 20.273157, lng: 85.806458 }; // TODO change to orgs default center value.

  const repeatedCoords = path.filter(
    (coord: LatLng, index, self) =>
      index !==
      self.findIndex((t) => t.lat === coord.lat && t.lng === coord.lng)
  ); // Find repeated coordinates

  const getSvgIconPathData = () => {
    const icon = <DirectionsCarIcon />;
    const svgString = new XMLSerializer().serializeToString(icon.props.children);
    return encodeURIComponent(svgString);
  };
  const carIconUrl = `data:image/svg+xml;utf8,${getSvgIconPathData}`;
  
  return (
    <div className="relative h-screen p-2">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "95%" }}
        center={center}
        zoom={13}
        options={{
          gestureHandling: "greedy",
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        <Polyline
          path={path}
          options={{
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
          }}
        />


          <Marker
            key={vehicleNumber}
            position={end}
            icon={{
              url: carIconUrl,
              scale: 8, // Bigger size for repeated location
              fillColor: "blue",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "blue",
            }}
          />

      </GoogleMap>
    </div>
  );
};

export default TravelPath;
