"use client";

import GoogleMapProvider from "@/app/google-map-provider";
import TravelPath from "@/app/ui/dashboard/travel-path";
// import TravelPathLeaflet from "@/app/ui/dashboard/travel-path-leaflet";
import GoogleMapWithDrawing from "@/app/ui/geofence/google-map-with-drawing";

export default async function Page({
  params,
}: {
  params: Promise<{ vehicleNumber: string }>;
}) {
  const vehicleNumber = (await params).vehicleNumber;
  return (
    <>
      {/* <GoogleMapGeoFenceCreate/> */}
      <TravelPath vehicleNumber={vehicleNumber} />
      {/* <TravelPathLeaflet/> */}
    </>
  );
}
