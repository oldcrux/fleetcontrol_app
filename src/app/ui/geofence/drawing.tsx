"use client";
import React, { useState, useEffect } from "react";
import {
  ControlPosition,
  InfoWindow,
  Map,
  MapControl,
} from "@vis.gl/react-google-maps";
import { geofenceDrawingManager } from "../util/geofence-drawing-manager";
import { Button } from "../button";
import {
  bulkCreateGeofences,
  createGeofence,
  deleteGeofenceLocation,
  searchGeofence,
} from "@/app/lib/geofence-utils";
import { useSession } from "next-auth/react";
import { Shape } from "@/app/lib/types";
import { BulkCreateGeofences } from "./bulk-create-geofences";

const Drawing = () => {
  const drawingManager = geofenceDrawingManager();
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [activeShapeIndex, setActiveShapeIndex] = useState<any>();
  const [selectedShape, setSelectedShape] = useState<any>(null); // Track selected shape
  const [geofenceLocationGroup, setGeofenceLocationGroup] = useState("");

  const { data: session, status } = useSession();
  const orgId = session?.user?.orgId;
  const userId = session?.user?.id;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleBulkCreateGeofences = (data: any) => {
    // console.log("Saved Data:", data);
    setIsModalOpen(false);

    const updatedData = data.map((item: any) => ({
      ...item,
      createdBy: userId,
      orgId: orgId,
    }));

    bulkCreateGeofences(updatedData);
  };

  useEffect(() => {
    if (!drawingManager) return;

    const overlayCompleteListener = google.maps.event.addListener(
      drawingManager,
      "overlaycomplete",
      (drawResult: any) => {
        // console.log(drawResult.overlay);
        const newShape = {
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

        google.maps.event.addListener(newShape.overlay, "click", () => {
          setSelectedShape(newShape);
          setActiveShapeIndex(shapes.length); // Focus on the shape
        });

        // console.log(`shapes created ${newShape}`);
        setShapes((prev) => [...prev, newShape]);
        setActiveShapeIndex(shapes.length); // Open the latest InfoWindow
      }
    );

    return () => {
      google.maps.event.removeListener(overlayCompleteListener);
    };
  }, [drawingManager, shapes.length]);

  // useEffect(() => {
  //   const fetchGeofences = async () => {
  //     const query = '';
  //     const geofences = await searchGeofence(query);
  //     // console.log(`dashboardmap:useEffect: geofences fetched: ${JSON.stringify(geofences)}`);
  //     if (geofences.length > 0) {
  //       const newShapes = geofences.map((geofence) => {
  //         const overlay = {
  //           type: geofence.geofenceType,
  //           path: geofence.geofenceType === "polygon"
  //               ? JSON.parse(geofence.polygon)
  //               : null,
  //           center: geofence.geofenceType === "circle"
  //               ? JSON.parse(geofence.center)
  //               : null,
  //           radius: geofence.radius,
  //         };
  //         return overlay;
  //       });
  //       console.log(newShapes.overlay);
  //       setShapes(newShapes);
  //     }
  //   };
  //   fetchGeofences().catch(console.error);
  // }, []);

  const saveShapes = () => {
    const shapeData = shapes.map((shape) => {
      const { type, overlay } = shape;
      let details = {
        tag: shape.name,
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
    // console.log(`drawing:saveShapes: geofence data to save ${geofenceDataToSave} with groupname ${geofenceLocationGroup}`);
    createGeofence(geofenceDataToSave);
  };

  const handleGeofenceGroupValueChange = (e: any) => {
    setGeofenceLocationGroup(e.target.value); // Update the value of the new input field
  };

  const handleInputChange = (index: any, value: any) => {
    const newShapes = [...shapes];
    newShapes[index].name = value;
    setShapes(newShapes);
  };

  // Delete the selected shape
  const deleteSelectedShape = () => {
    // console.log(`deleting shape ${selectedShape.name}`);
    if (selectedShape) {
      selectedShape.overlay.setMap(null); // Remove from map
      setShapes((prev) => prev.filter((shape) => shape !== selectedShape)); // Remove from state
      setSelectedShape(null);
      setActiveShapeIndex(null); // Reset active shape
    }
    deleteGeofenceLocation(orgId as string, selectedShape.name);
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
        />

         <div className="relative shadow-md z-10 flex space-x-4">
          <Button onClick={saveShapes}>Save</Button>
          <Button
            onClick={deleteSelectedShape}
            className="bg-red-500 hover:bg-red-400 active:bg-red-600"
          >
            Delete
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-400 active:bg-blue-600"
          >
            Bulk Create Geofences
          </Button>
          <BulkCreateGeofences
            show={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleBulkCreateGeofences}
          />
        </div>
      </div>

      <div className="h-full p-2">
        <Map
          defaultZoom={10}
          defaultCenter={{ lat: 20.3008649, lng: 85.7380516 }}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          zoomControl={true}
          // options={{
          //   zoomControl: true,
          //   fullscreenControl: false,
          //   mapTypeControl: false,
          //   streetViewControl: false,
          //   rotateControl: false,
          // }}
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
                value={shapes[index].name || ""}
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
