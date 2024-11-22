"use client";

import Grafana from "@/app/ui/dashboard/grafana";

export default async function Page({
  params,
}: {
  params: Promise<{ vehicleNumber: string }>;
}) {
  const vehicleNumber = (await params).vehicleNumber;
  return (
    <>
      {/* <GoogleMapGeoFenceCreate/> */}
      {/* <TravelPath vehicleNumber={vehicleNumber} /> */}
      {/* <TravelPathLeaflet/> */}

      <Grafana vehicleNumber={vehicleNumber} />
    </>
  );
}
