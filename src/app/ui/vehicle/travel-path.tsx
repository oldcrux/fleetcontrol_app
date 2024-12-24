import React, { useEffect, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Polyline,
  Marker,
} from "@react-google-maps/api";
import { fetchVehiclesTravelPath } from "@/app/lib/vehicle-utils";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useSession } from "next-auth/react";
import Modal from "@mui/material/Modal";
import { Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;

interface LatLng {
  lat: number;
  lng: number;
}

interface TravelPathProps {
  vehicleNumber: string; // Assuming vehicleNumber is a string
  show: boolean;
  onClose: () => void;
}

const TravelPath: React.FC<TravelPathProps> = ({
  vehicleNumber,
  show,
  onClose,
}) => {
  const [path, setPaths] = useState<LatLng[]>([]);
  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId
    ? session?.user?.secondaryOrgId
    : session?.user?.primaryOrgId;

  useEffect(() => {
    const fetchGeofences = async () => {
      const latlngs = await fetchVehiclesTravelPath(
        session?.token.idToken,
        vehicleNumber
      );
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
    const svgString = new XMLSerializer().serializeToString(
      icon.props.children
    );
    return encodeURIComponent(svgString);
  };
  const carIconUrl = `data:image/svg+xml;utf8,${getSvgIconPathData}`;

  return (
    <Modal
      open={show}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: {
            xs: "90%", // 90% of the viewport width on extra-small screens
            sm: 800, // 800px on small screens and up
            md: 1000, // 1000px on medium screens and up
          },
          height: {
            xs: "90%", // 80% of the viewport height on extra-small screens
            sm: 700, // 700px on small screens and up
          },
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 2, // Increased padding
          borderRadius: 2,
          overflow: "auto", // Ensures content scrolls if it overflows
        }}
      >
        <div className="absolute top-1 right-1 mr-2 mt-2">
          <button
            className="absolute top-1 right-1 -mr-3 -mt-3 z-30 text-black rounded-full w-5 h-5 flex items-center justify-center"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
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
      </Box>
    </Modal>
  );
};

export default TravelPath;
