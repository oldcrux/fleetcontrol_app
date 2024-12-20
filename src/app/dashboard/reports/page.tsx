"use client"
import React from 'react';
import GeofenceRunningReportTable from "@/app/ui/runningreport/geofence-running-report-table";
import VehicleRunningReportTable from "@/app/ui/runningreport/vehicle-running-report-table";
import { Button } from "@/app/ui/button";
import { ScrollDownIndicator } from "@/app/ui/util/scrolldown-Indicator";
import { triggerAllReportGeneration } from "@/app/lib/vehicle-utils";
import { useSession } from "next-auth/react";


export default function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {

  const { data: session } = useSession();
  const role = session?.user?.role;
  const orgId = session?.user?.secondaryOrgId ? session?.user?.secondaryOrgId : session?.user?.primaryOrgId;

  // const scrollRef = useRef(null);
  
  // const query = searchParams?.query || "";
  // const currentPage = Number(searchParams?.page) || 1;

  const generateReport = () => {
    triggerAllReportGeneration(session?.token.idToken, orgId as string);
  };

  return (

    // <div ref={scrollRef} className="w-full">
       <div className="w-full">
      <div className="flex w-full items-center justify-between mb-2">
        <h1 className="text-2xl font-medium text-white">Geofence Report</h1>
        {role !=='view' && <Button onClick={generateReport}>Generate Daily Reports</Button> }
      </div>

      <div className="md:grid-cols-4 lg:grid-cols-8">
        <GeofenceRunningReportTable />
        <div className="flex w-full items-center justify-between mb-2 mt-6">
          <h1 className="text-2xl font-medium text-white">Vehicle Report</h1>
        </div>
        <VehicleRunningReportTable />
      </div>

      {/* <ScrollDownIndicator scrollContainerRef={scrollRef} /> */}
    </div>
  );
}
