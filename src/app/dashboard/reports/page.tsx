"use client";
import React, { useState, useEffect } from "react";
import GeofenceRunningReportTable from "@/app/ui/runningreport/geofence-running-report-table";
import VehicleRunningReportTable from "@/app/ui/runningreport/vehicle-running-report-table";
import { Button } from "@/app/ui/button";
import { ScrollDownIndicator } from "@/app/ui/util/scrolldown-Indicator";
import { triggerAllReportGeneration } from "@/app/lib/vehicle-utils";
import { useSession } from "next-auth/react";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import { reportGenerationProgress } from "@/app/lib/redis-utils";
import { CircularProgress } from "@mui/material";
import CircularProgressWithLabel from "@/app/ui/util/CircularProgressWithLabel";

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
  const orgId = session?.user?.secondaryOrgId
    ? session?.user?.secondaryOrgId
    : session?.user?.primaryOrgId;
  const [isDisabled, setIsDisabled] = useState(false);
  const [progress, setProgress] = useState(0);

  // const scrollRef = useRef(null);

  // const query = searchParams?.query || "";
  // const currentPage = Number(searchParams?.page) || 1;

  const generateReport = () => {
    setIsDisabled(true);
    triggerAllReportGeneration(session?.token.idToken, orgId as string);
  };

  useEffect(() => {
    if (isDisabled) {
      const reportGenerationProgressCheck = async () => {
        const progress = await reportGenerationProgress(session?.token.idToken, orgId as string)
        // console.log(`report generation progress: ${progress}`);
        setProgress(progress);
        if(progress == null){
          setIsDisabled(false);
        }
      };
      reportGenerationProgressCheck().catch(console.error);
      const interval = setInterval(reportGenerationProgressCheck, 10000);
      return () => clearInterval(interval);
    }
  }, [isDisabled]);

  return (
    // <div ref={scrollRef} className="w-full">
    <div className="w-full">
      <div className="flex w-full items-center justify-between mb-2">
        <h1 className="text-2xl font-medium text-white">Geofence Report</h1>
        
        <div className="block sm:hidden">
        {isDisabled &&  <CircularProgressWithLabel value={progress} />}
        </div>
        {role !== "view" && (
          <Button
            onClick={generateReport}
            disabled={isDisabled}
            icon={
              <AssessmentOutlinedIcon
                sx={{ paddingLeft: 1, fontSize: 25, color: "#d5d7db" }}
              />
            }
          >
            {isDisabled ? <CircularProgressWithLabel value={progress} /> : 'Generate Daily Reports'}
          </Button>
        )}
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
