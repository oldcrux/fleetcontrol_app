"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Map } from "@vis.gl/react-google-maps";

import { createGeofence, searchGeofence } from "@/app/lib/geofence-utils";
import { geofenceDrawingManager } from "../util/geofence-drawing-manager";
import { VehicleMarkers } from "./live-vehicle-marker";
import { useSession } from "next-auth/react";
// import { Shape } from "@/app/lib/Types";

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

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
  const drawingManager = geofenceDrawingManager();
  const [searchParam, setSearchParam] = useState<string>();

  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId ? session?.user?.secondaryOrgId : session?.user?.primaryOrgId;
  const vendorId = session?.user?.secondaryOrgId ? session?.user?.primaryOrgId : '';
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
      const encodedViewport = '';
      const params = new URLSearchParams(searchParams);
      const searchParam = params.get("query");
      // console.log(`request param`, searchParam);
      if (searchParam) {
        // console.log(searchParam);
        setSearchParam(searchParam);

        const geofences = await searchGeofence(
          orgId as string,
          encodedViewport,
          searchParam as string
        );
        // console.log(`dashboardmap:useEffect: geofences fetched: ${JSON.stringify(geofences)}`);
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
            };
            return overlay;
          });
          setShapes(newShapes);
        }
      }
    };
    fetchGeofences().catch(console.error);
  }, []);
  // }, [viewport]);

  useEffect(() => {
    let eventSource: any;
    const fetchRunningVehicles = async () => {
      try {
        // const encodedViewport = encodeURIComponent(JSON.stringify(viewport));
        // console.log(`bound values: ${encodedViewport}`);
        const params = new URLSearchParams(searchParams);
        
        // let path = `/node/api/vehicleTelemetryData/fetchAllVehiclesSSE?orgId=${orgId}&encodedViewport=${encodedViewport}`;
        let path = `/node/api/vehicleTelemetryData/fetchAllVehiclesSSE?orgId=${orgId}&vendorId=${vendorId}`;
        const searchParam = params.get("query");
        // console.log(`request param received`, searchParam);
        if (searchParam) {
          setSearchParam(searchParam);
          path = `${path}&query=${searchParam}`;
        }
        // console.log(`request path`, path);
        eventSource = new EventSource(`${nodeServerUrl}${path}`); // Connect to SSE endpoint

        eventSource.onmessage = (event: any) => {
          const eventData = JSON.parse(event.data);
          // console.log(`all vehicles fetched=>`, event.data);
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
            // console.log(`dashboardmap:fetchRunningVehicles: vehicle current location => ${JSON.stringify(vehicle)}`);
            setVehicles(vehicle);
          } else {
            setVehicles([]);
          }
        };
      } catch (error) {
        console.log(error);
      }
    };
    fetchRunningVehicles();

    return () => {
      if (eventSource) {
        eventSource.close();
        console.log("map SSE connection closed");
      }
    };
  }, []);
  // }, [viewport, searchParam]);

  useEffect(() => {
    if (!drawingManager) return;
    drawingManager.setOptions({ drawingControl: false, drawingMode: null });
    // console.log(`use effect - set drawing manager`);

    // Iterate over the shapes and render the appropriate overlays
    shapes.forEach((shape) => {
      let shapeOverlay;
      if (shape.type === "polygon" && shape.path) {
        shapeOverlay = new google.maps.Polygon({
          paths: shape.path,
          map: drawingManager.getMap(),
          // options: drawingManager.get("polygonOptions"),
          editable: false,
          draggable: false,
        });
      } else if (shape.type === "circle" && shape.center) {
        new google.maps.Circle({
          center: shape.center,
          radius: shape.radius,
          map: drawingManager.getMap(),
          // options: drawingManager.get("circleOptions"),
          strokeColor: "#ef4444",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#fca5a5",
          fillOpacity: 0.35,
          editable: false,
          draggable: false,
        });
      }
    });
  }, [drawingManager, shapes]);

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

        <VehicleMarkers vehicles={vehicles} />
      </div>
    </>
  );
}
