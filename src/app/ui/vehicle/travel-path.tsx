import React, { useEffect, useState } from "react";
import { fetchVehiclesTravelPath } from "@/app/lib/vehicle-utils";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useSession } from "next-auth/react";
import Modal from "@mui/material/Modal";
import { Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { off_vehicle_color } from "../util/color_picker";
import { AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import type { Feature, GeoJSON } from "geojson";
import { GeoJsonLayer } from "@deck.gl/layers";
import { DeckGlOverlay } from "../util/deckgl-overlay";

interface LatLng {
  lat: number;
  lng: number;
}

interface TravelPathProps {
  vehicleNumber: string;
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

  useEffect(() => {
    const fetchGeofences = async () => {
      const latlngs = await fetchVehiclesTravelPath(
        session?.token.idToken,
        vehicleNumber
      );
      if (latlngs.length > 0) {
        const paths = latlngs.map((geofence: any) => {
          // Assuming latlng data is available from fetchVehiclesTravelPath
          return { lat: geofence.lat, lng: geofence.lng };
        });
        setPaths(paths);
        // console.log(`paths==`, paths, vehicleNumber);
      }
    };
    fetchGeofences().catch(console.error);
  }, [vehicleNumber]);

  const start = path[0];
  const end = path[path.length - 1];
  const center = start;

  function convertToMultiLineString(data: any): GeoJSON.FeatureCollection {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "MultiLineString",
            coordinates: [
              data.map((point: any) => [point.lng, point.lat]), // Convert to [lng, lat]
            ],
          },
          properties: {},
        },
      ],
    };
  }

  const geoJsonData = convertToMultiLineString(path);

  function getDeckGlLayers(data: GeoJSON | null) {
    if (!data) return [];

    return [
      new GeoJsonLayer({
        id: "geojson-layer",
        data,
        stroked: false,
        filled: true,
        extruded: true,
        pointType: "circle",
        lineWidthScale: 20,
        lineWidthMinPixels: 4,
        // getFillColor: [160, 160, 180, 200],
        // getLineColor: (f: Feature) => {
        //   const hex = f?.properties?.color;
        //   if (!hex) return '[0, 0, 0]';
        //   return hex.match(/[0-9a-f]{2}/g)!.map((x: string) => parseInt(x, 16));
        // },
        getLineColor: [256, 70, 30, 180],
        getPointRadius: 2,
        getLineWidth: 0.001,
        // getElevation: 30
      }),
    ];
  }

  const renderCustomPin = () => {
    return (
      <>
        <div className="custom-pin">
          <div className="image-container">
            <DirectionsCarIcon
              sx={{
                color: off_vehicle_color,
              }}
            />
          </div>
        </div>
      </>
    );
  };

  return (
    <Modal
      open={show}
      onClose={onClose}
      aria-labelledby="mapModal"
      aria-describedby="travel-path-map-modal"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: {
            xs: "90%",
            sm: 800,
            md: 1200,
          },
          height: {
            xs: "90%",
            sm: 700,
          },
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 2,
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

        <Map
          defaultZoom={14}
          defaultCenter={start}
          gestureHandling={"greedy"}
          zoomControl={true}
          mapId="da37f3254c6a6d1c" // TODO this is demo mapId. need to change it.
          // follow https://developers.google.com/maps/documentation/get-map-id
        />
        <DeckGlOverlay layers={getDeckGlLayers(geoJsonData)} />
        <AdvancedMarker position={end}> {renderCustomPin()}</AdvancedMarker>
      </Box>
    </Modal>
  );
};

export default TravelPath;
