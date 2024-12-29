import React, { useEffect, useState } from "react";
import { fetchVehiclesTravelPath } from "@/app/lib/vehicle-utils";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useSession } from "next-auth/react";
import Modal from "@mui/material/Modal";
import { Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { geofence_touched_color, geofence_untouched_color, off_vehicle_color } from "../util/color_picker";
import { AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import type { Feature, GeoJSON } from "geojson";
import { GeoJsonLayer } from "@deck.gl/layers";
import { DeckGlOverlay } from "../util/deckgl-overlay";
import { searchGeofence } from "@/app/lib/geofence-utils";

interface LatLng {
  lat: number;
  lng: number;
}

interface Shape {
  type: string;
  path: any[];
  center: google.maps.LatLng;
  radius: number;
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
  const [shapes, setShapes] = useState<Shape[]>([]);
  const orgId = session?.user?.secondaryOrgId
  ? session?.user?.secondaryOrgId
  : session?.user?.primaryOrgId;

  const start = path[0];
  const end = path[path.length - 1];
  const center = start;

  useEffect(() => {
    const fetchPath = async () => {
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
    fetchPath().catch(console.error);
  }, [vehicleNumber]);

  useEffect(() => {
    const fetchGeofences = async () => {
      // const encodedViewport = encodeURIComponent(JSON.stringify(viewport));
      // console.log(`encodedViewport from session: ${encodedViewport}`);
      const encodedViewport = "";

        const geofences = await searchGeofence(
          session?.token.idToken,
          orgId as string,
          encodedViewport,
          vehicleNumber as string
        );
        console.log(`dashboardmap:useEffect: geofences fetched:`, geofences);
        if (geofences.length > 0) {
          const newShapes = geofences.map((geofence: any) => {
            const overlay = {
              type: geofence.geofenceType,
              path:
                geofence.geofenceType === "polygon"
                  ? JSON.parse(geofence.polygon)
                  : null,
              center:
                geofence.geofenceType === "circle"
                  ? JSON.parse(geofence.center)
                  : null,
              radius: geofence.radius,
              touched: geofence.touched
            };
            return overlay;
          });
          setShapes(newShapes);
        }
      
    };
    fetchGeofences().catch(console.error);
    // const interval = setInterval(fetchGeofences, 10000);
    // return () => clearInterval(interval);
  }, [vehicleNumber]);

  function convertToGeoJSON(shapes: any): GeoJSON.FeatureCollection {
      return {
        type: "FeatureCollection",
        features: shapes.map((geofence: any) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [geofence.center.lng, geofence.center.lat], // Convert lat/lng to [lng, lat]
          },
          properties: {
            radius: geofence.radius,
            color: geofence.touched===false ? geofence_untouched_color : geofence_touched_color, //TODO add feature flag here.
          },
        })),
      };
    }
    const geofenceGeoJsonData = convertToGeoJSON(shapes);

    function getGeofenceDeckGlLayers(data: GeoJSON | null) {
      if (!data) return [];
      return [
        new GeoJsonLayer({
          id: "geojson-layer",
          data: data,
          stroked: false,
          filled: true,
          extruded: true,
          pointType: "circle",
          getFillColor: (f: any) => f.properties.color,
          getPointRadius: 30,
        }),
      ];
    }

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

  function getTravelPathDeckGlLayers(data: GeoJSON | null) {
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
        getLineColor: [84, 88, 94, 180],
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
        // zoom={14}
          defaultZoom={14}
          defaultCenter={end}
          gestureHandling={"greedy"}
          zoomControl={true}
          mapId="da37f3254c6a6d1c" // TODO this is demo mapId. need to change it.
          // follow https://developers.google.com/maps/documentation/get-map-id
        />
        <DeckGlOverlay layers={getGeofenceDeckGlLayers(geofenceGeoJsonData)}/>
        <DeckGlOverlay layers={getTravelPathDeckGlLayers(geoJsonData)} />
        <AdvancedMarker position={end}> {renderCustomPin()}</AdvancedMarker>
      </Box>
    </Modal>
  );
};

export default TravelPath;
