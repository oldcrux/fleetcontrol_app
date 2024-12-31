"use client";
// import { fetchEventSource } from "@microsoft/fetch-event-source";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Map } from "@vis.gl/react-google-maps";

import { createGeofence, searchGeofence } from "@/app/lib/geofence-utils";
import { geofenceDrawingManager } from "../util/geofence-drawing-manager";
import { VehicleMarkers } from "./live-vehicle-marker";
import { useSession } from "next-auth/react";
// import { Shape } from "@/app/lib/Types";
import type { Feature, GeoJSON } from "geojson";
import { GeoJsonLayer } from "@deck.gl/layers";
import { DeckGlOverlay } from "../util/deckgl-overlay";
import {
  geofence_touched_color,
  geofence_untouched_color,
} from "../util/color_picker";
import axios from "axios";

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;
const controller = new AbortController();
const signal = controller.signal;

interface Shape {
  type: string;
  path: any[];
  center: google.maps.LatLng;
  radius: number;
}

// interface Viewport {
//   north: number | null;
//   south: number | null;
//   east: number | null;
//   west: number | null;
// }

export default function DashboardMap({ query }: { query: string }) {
  const searchParams = useSearchParams();
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [vehicles, setVehicles] = useState([]);
  // const drawingManager = dashboardDrawingManager()
  // const drawingManager = geofenceDrawingManager();
  const [searchParam, setSearchParam] = useState<string>();

  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId
    ? session?.user?.secondaryOrgId
    : session?.user?.primaryOrgId;
  const vendorId = session?.user?.secondaryOrgId
    ? session?.user?.primaryOrgId
    : "";
  const orgLatitude = Number(session?.user?.orgLatitude);
  const orgLongitude = Number(session?.user?.orgLongitude);

  // const [viewport, setViewport] = useState<Viewport>({
  //   north: null,
  //   south: null,
  //   east: null,
  //   west: null,
  // });

  // Handle bounds change and debounce the loading function to avoid excessive calls
  // const handleBoundsChanged = useCallback(() => {
  //   if (!drawingManager?.getMap()) return;
  //   const bounds = drawingManager?.getMap()?.getBounds();

  //   const north = bounds?.getNorthEast().lat() ?? null;
  //   const south = bounds?.getSouthWest().lat() ?? null;
  //   const east = bounds?.getNorthEast().lng() ?? null;
  //   const west = bounds?.getSouthWest().lng() ?? null;

  //   // console.log(`bound values: ${east}, ${west}, ${north}, ${south}`);
  //   setViewport({ north, south, east, west });
  // }, [drawingManager?.getMap()]);

  // useEffect(() => {
  //   const map = drawingManager?.getMap();
  //   if (!map) return;

  //   // Add the event listener to the map for bounds_changed
  //   const listener = map.addListener("bounds_changed", handleBoundsChanged);

  //   // Clean up the listener on component unmount
  //   return () => google.maps.event.removeListener(listener);
  // }, [drawingManager, handleBoundsChanged]);

  useEffect(() => {
    const fetchGeofences = async () => {
      // const encodedViewport = encodeURIComponent(JSON.stringify(viewport));
      // console.log(`encodedViewport from session: ${encodedViewport}`);
      const encodedViewport = "";
      const params = new URLSearchParams(searchParams);
      const searchParam = params.get("query");
      // console.log(`request param`, searchParam);
      if (searchParam) {
        // console.log(`request param`, searchParam);
        setSearchParam(searchParam);

        const geofences = await searchGeofence(
          session?.token.idToken,
          orgId as string,
          encodedViewport,
          searchParam as string
        );
        // console.log(`dashboardmap:useEffect: geofences fetched:`);
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
              touched: geofence.touched,
            };
            return overlay;
          });
          setShapes(newShapes);
        }
      }
    };
    fetchGeofences().catch(console.error);
    const interval = setInterval(fetchGeofences, 10000);
    return () => clearInterval(interval);
  }, []);
  // }, [viewport]);

  useEffect(() => {
    let eventSource: any;
    const params = new URLSearchParams(searchParams);

    // let path = `/node/api/vehicleTelemetryData/fetchAllVehiclesSSE?orgId=${orgId}&encodedViewport=${encodedViewport}`;
    let path = `/node/api/vehicleTelemetryData/fetchAllVehiclesSSE?orgId=${orgId}&vendorId=${vendorId}`;
    const searchParam = params.get("query");
    
    if (searchParam) {
      setSearchParam(searchParam);
      path = `${path}&query=${searchParam}`;
    }

    const fetchRunningVehicles = async () => {
      console.log(`request param received`, path);
      try {
        const url = new URL(path, nodeServerUrl);
        const response = await axios.get(`${url}`, {
          headers: {
            Authorization: `Bearer ${session?.token.idToken}`,
          },
          // withCredentials: true,
        });

        const eventData = await response.data;
        if (eventData.length > 0) {
          const vehicle = eventData.map((event: any) => ({
            ignition: event.ignition,
            key: event.vehicleNumber,
            speed: event.speed,
            location: {
              lat: event.latitude,
              lng: event.longitude,
            },
          }));
          console.log(`dashboardmap:fetchRunningVehicles: vehicle current location => ${JSON.stringify(vehicle)}`);
          setVehicles(vehicle);
        } else {
          setVehicles([]);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchRunningVehicles();
    const interval = setInterval(fetchRunningVehicles, 10000);
    return () => clearInterval(interval);

    //TODO this is not working. The connection is not getting closed when navigating away from dashboard
    // return () => {
    //   controller.abort();
    //   console.log("map SSE connection closed");
    // };
  }, []);
  // }, [viewport, searchParam]);

  // useEffect(() => {
  //   if (!drawingManager) return;
  //   drawingManager.setOptions({ drawingControl: false, drawingMode: null });
  // }, [drawingManager]);

  //TODO - will change the geofence save logic to center [lng, lat] from {"lat":20.3298,"lng":85.8137}
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
          color:
            geofence.touched === false
              ? geofence_untouched_color
              : geofence_touched_color, //TODO add feature flag here.
        },
      })),
    };
  }
  const geoJsonData = convertToGeoJSON(shapes);

  function getDeckGlLayers(data: GeoJSON | null) {
    if (!data) return [];
    return [
      new GeoJsonLayer({
        id: "geojson-layer",
        data: data,
        stroked: false,
        filled: true,
        extruded: true,
        pointType: "circle",
        // lineWidthScale: 20,
        // lineWidthMinPixels: 4,
        // getFillColor: [255, 70, 30, 180],
        getFillColor: (f: any) => f.properties.color,
        // getLineColor: (f: Feature) => {
        //   const hex = f?.properties?.color;
        //   if (!hex) return [0, 0, 0];
        //   return hex.match(/[0-9a-f]{2}/g)!.map((x: string) => parseInt(x, 16));
        // },
        getPointRadius: 30,
        // getRadius: (f: any) => f.properties.radius,
        // getLineWidth: 3,
        // getLineColor: [70, 70, 30, 180],
        // getElevation: 100,
      }),
    ];
  }

  return (
    <>
      <div className="h-screen lg:p-2">
        <Map
          defaultZoom={14}
          defaultCenter={{ lat: 20.2827, lng: 85.8427 }}
          // defaultCenter={{ lat: orgLatitude, lng: orgLongitude }}
          gestureHandling={"greedy"}
          zoomControl={true}
          // mapTypeId="satellite"
          mapId="da37f3254c6a6d1c" // TODO this is demo mapId. need to change it.
          // follow https://developers.google.com/maps/documentation/get-map-id
        />
        <DeckGlOverlay layers={getDeckGlLayers(geoJsonData)} />
        <VehicleMarkers vehicles={vehicles} />
      </div>
    </>
  );
}
