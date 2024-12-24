"use client";
import React, { useState, useEffect } from "react";
import { InfoWindow, Map } from "@vis.gl/react-google-maps";
import { geofenceDrawingManager } from "../util/geofence-drawing-manager";
import { Button } from "../button";
import {
  bulkCreateGeofences,
  createGeofence,
  deleteGeofenceLocation,
  fetchGeofence,
  searchGeofence,
} from "@/app/lib/geofence-utils";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Shape } from "@/app/lib/types";
import { BulkCreateGeofences } from "./bulk-create-geofences";
import { GeofencesModal } from "./geofences-modal";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AddLocationAltOutlinedIcon from "@mui/icons-material/AddLocationAltOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

const Drawing = () => {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const drawingManager = geofenceDrawingManager();
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [activeShapeIndex, setActiveShapeIndex] = useState<any>();
  const [selectedShape, setSelectedShape] = useState<any>(null); // Track selected shape
  const [geofenceLocationGroup, setGeofenceLocationGroup] = useState("");

  const { data: session, status } = useSession();
  const orgId = session?.user?.secondaryOrgId
    ? session?.user?.secondaryOrgId
    : session?.user?.primaryOrgId;
  const userId = session?.user?.userId;

  const [isBulkCreateModalOpen, setIsBulkCreateModalOpen] = useState(false);
  const [isGeofenceListModalOpen, setIsGeofenceListModalOpen] = useState(false);

  const handleBulkCreateGeofences = (data: any) => {
    // console.log("Saved Data:", data);
    setIsBulkCreateModalOpen(false);

    const updatedData = data.map((item: any) => ({
      ...item,
      createdBy: userId,
      orgId: orgId,
    }));

    bulkCreateGeofences(session?.token.idToken, updatedData);
  };

  const attachClickListener = (shape: any, index: any) => {
    google.maps.event.addListener(shape.overlay, "click", () => {
      setSelectedShape(shape);
      setActiveShapeIndex(index); // Focus on the clicked shape
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const searchParam = params.get("query");
    setGeofenceLocationGroup(searchParam as string);
  }, [searchParams]);

  useEffect(() => {
    if (!drawingManager) return;

    const overlayCompleteListener = google.maps.event.addListener(
      drawingManager,
      "overlaycomplete",
      (drawResult: any) => {
        // console.log(drawResult.overlay);
        const newShape = {
          id: "",
          type: drawResult.type,
          overlay: drawResult.overlay,
          name: "", // Initially empty
          radius:
            drawResult.type === google.maps.drawing.OverlayType.CIRCLE
              ? drawResult.overlay.getRadius()
              : null, // Store radius
        };
        google.maps.event.addListener(
          newShape.overlay,
          "radius_changed",
          () => {
            const newRadius = newShape.overlay.getRadius();
            const updatedShapes = shapes.map((s, i) =>
              i === shapes.length - 1 ? { ...s, radius: newRadius } : s
            );
            // console.log(newRadius);
            setShapes(updatedShapes);
          }
        );

        attachClickListener(newShape, shapes.length);

        setShapes((prev) => [...prev, newShape]);
        setActiveShapeIndex(shapes.length); // Open the latest InfoWindow
      }
    );

    return () => {
      google.maps.event.removeListener(overlayCompleteListener);
    };
  }, [drawingManager, shapes.length]);

  useEffect(() => {
    const map = drawingManager?.getMap();
    const fetchGeofences = async () => {
      if (geofenceLocationGroup) {
        cleanupShapes();

        const query = `geofenceLocationGroupName=${geofenceLocationGroup}`;
        // console.log(`useEffect called with query`, query);
        const geofences = await fetchGeofence(
          session?.token.idToken,
          orgId as string,
          query
        );

        if (geofences.length > 0) {
          // console.log(`dashboardmap:useEffect: geofences fetched: ` , geofences);
          const newShapes = geofences.map((geofence: any) => {
            let overlay;
            const color = "#eb6434";
            if (geofence.geofenceType === "circle") {
              const center = JSON.parse(geofence.center); // Parse stringified center
              overlay = new google.maps.Circle({
                center,
                radius: geofence.radius,
                map,
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: color,
                fillOpacity: 0.35,
              });
            } else if (geofence.geofenceType === "polygon") {
              // const path = geofence.polygon.map(coord => ({ lat: coord.lat, lng: coord.lng }));
              // overlay = new google.maps.Polygon({
              //     paths: path,
              //     map,
              // });
            }
            if (overlay) {
              google.maps.event.addListener(overlay, "click", () => {
                setSelectedShape({
                  id: geofence.id,
                  type: geofence.geofenceType,
                  overlay,
                  tag: geofence.tag,
                  radius: geofence.radius || null,
                });
              });
            }

            return {
              id: geofence.id,
              type: geofence.geofenceType,
              overlay,
              tag: geofence.tag,
              radius: geofence.radius || null,
            };
          });
          // console.log(`shapes: `, newShapes);
          setShapes(newShapes);
        } else {
          cleanupShapes();
        }
      }
    };
    fetchGeofences().catch(console.error);
  }, [geofenceLocationGroup]);

  const cleanupShapes = () => {
    shapes.forEach((shape) => {
      if (shape.overlay) {
        shape.overlay.setMap(null);
      }
    });
    setShapes([]);
  };

  const saveShapes = () => {
    const shapeData = shapes.map((shape) => {
      const { type, overlay } = shape;
      let details = {
        id: shape.id,
        tag: shape.tag,
        geofenceType: type,
        geofenceLocationGroupName: geofenceLocationGroup,
        createdBy: userId,
        orgId: orgId,
        radius: 0,
        center: 0,
        polygon: 0,
      };

      if (type === google.maps.drawing.OverlayType.CIRCLE) {
        details.radius = overlay.getRadius();
        details.center = overlay.getCenter().toJSON();
      } else if (
        type === google.maps.drawing.OverlayType.POLYGON ||
        type === google.maps.drawing.OverlayType.POLYLINE
      ) {
        details.polygon = overlay
          .getPath()
          .getArray()
          .map((latLng: any) => latLng.toJSON());
      }
      return details;
    });

    const geofenceDataToSave = JSON.stringify(shapeData, null, 2);
    console.log(
      `drawing:saveShapes: geofence data to save ${geofenceDataToSave} with groupname ${geofenceLocationGroup}`
    );
    createGeofence(session?.token.idToken, geofenceDataToSave);
  };

  const debouncedSetGroup = useDebouncedCallback((value) => {
    // Perform side effects here, e.g., API calls or state updates
  }, 300);

  const handleGeofenceGroupValueChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setGeofenceLocationGroup(value); // Immediate update for input typing
    debouncedSetGroup(value); // Debounced side-effect
    if (!value) {
      cleanupShapes();
    }
  };

  const handleInputChange = (index: any, value: any) => {
    const newShapes = [...shapes];
    newShapes[index].tag = value;
    setShapes(newShapes);
  };

  // Delete the selected shape
  const deleteSelectedShape = () => {
    console.log(`deleting shape`, selectedShape);
    if (selectedShape) {
      selectedShape.overlay.setMap(null); // Remove from map
      setShapes((prev) => prev.filter((shape) => shape !== selectedShape)); // Remove from state
      setSelectedShape(null);
      setActiveShapeIndex(null); // Reset active shape
    }
    deleteGeofenceLocation(
      session?.token.idToken,
      session?.user.userId as string,
      orgId as string,
      selectedShape.tag,
      selectedShape.id
    );
  };

  return (
    <>
      <div className="p-2 flex items-center justify-between space-x-4">
        <input
          type="text"
          value={geofenceLocationGroup}
          onChange={handleGeofenceGroupValueChange}
          className="border border-gray-300 rounded-md p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500 input-text"
          placeholder="Enter Geofence Group"
          defaultValue={searchParams.get("query")?.toString()}
        />

        <div className="relative shadow-md z-10 flex space-x-4">
          <Button
            onClick={saveShapes}
            icon={
              <SaveOutlinedIcon
                sx={{ paddingLeft: 1, fontSize: 25, color: "#d5d7db" }}
              />
            }
          >
            Save
          </Button>
          <Button
            onClick={deleteSelectedShape}
            className="bg-red-500 hover:bg-red-400 active:bg-red-600"
            icon={
              <DeleteOutlinedIcon
                sx={{ paddingLeft: 1, fontSize: 25, color: "#d5d7db" }}
              />
            }
          >
            Delete
          </Button>
          <Button
            onClick={() => setIsBulkCreateModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-400 active:bg-blue-600"
            icon={
              <AddLocationAltOutlinedIcon
                sx={{ paddingLeft: 1, fontSize: 25, color: "#d5d7db" }}
              />
            }
          >
            Bulk Create Geofences
          </Button>
          <Button
            onClick={() => setIsGeofenceListModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-400 active:bg-blue-600"
            icon={
              <LocationOnOutlinedIcon
                sx={{ paddingLeft: 1, fontSize: 25, color: "#d5d7db" }}
              />
            }
          >
            All Geofence List
          </Button>
          <BulkCreateGeofences
            show={isBulkCreateModalOpen}
            onClose={() => setIsBulkCreateModalOpen(false)}
            onSave={handleBulkCreateGeofences}
          />
          <GeofencesModal
            show={isGeofenceListModalOpen}
            onClose={() => setIsGeofenceListModalOpen(false)}
          />
        </div>
      </div>

      <div className="h-full p-2">
        <Map
          defaultZoom={10}
          defaultCenter={{ lat: 20.3008649, lng: 85.7380516 }}
          gestureHandling={"greedy"}
          zoomControl={true}
        />
      </div>

      {shapes.map((shape, index) => {
        const position =
          shape.type === google.maps.drawing.OverlayType.CIRCLE
            ? shape.overlay.getCenter()
            : shape.overlay.getPath().getAt(0); // Use the first vertex for polygons/polylines

        return (
          <InfoWindow
            key={index}
            position={position.toJSON()}
            onCloseClick={() => setActiveShapeIndex(null)}
            shouldFocus={true}
          >
            {shape.type === google.maps.drawing.OverlayType.CIRCLE && (
              <div className="input-text p-2">
                <span>Radius: {shape.overlay.radius.toFixed(2)} meters</span>
              </div>
            )}
            <div className="bg-white p-0 rounded-lg shadow-lg max-w-xs">
              <input
                type="text"
                value={shapes[index].tag || ""}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 input-text"
                placeholder="Tag:"
                autoFocus={true} // Focus only on the currently active input
              />
            </div>
          </InfoWindow>
          // TODO handle focus change issue.
          // when there are multiple shapes 1, 2 created and you try to edit the tag of 1, cursor comes back to 2.
        );
      })}
    </>
  );
};

export default Drawing;
