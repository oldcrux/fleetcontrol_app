"use client";
import { Suspense, useEffect, useState } from "react";
import { CardsSkeleton, MapSkeleton } from "@/app/ui/skeletons";
import DashboardMap from "@/app/ui/dashboard/dashboard-map";
import Search from "@/app/ui/search";
import Chart from "@/app/ui/dashboard/chart";
import { Tooltip } from "@mui/material";
import LiveWidget from "@/app/ui/util/livewidget";


export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || "";

  return (
    <main>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4">
      
        <div className="col-span-1 row-span-1 lg:relative lg:col-start-4 lg:row-start-1 flex flex-col justify-between">
        {/* <div className="lg:absolute lg:bottom-4 lg:right-4">
            <Tooltip
              title="Search by VehicleNumber, Owner or VehicleGroup"
              arrow
              placement="top"
            >
              <Search placeholder="Search Vehicles..." />
            </Tooltip>
          </div> */}
          <div className="absolute right-4 top-4 lg:absolute lg:top-4 lg:right-4">
            <LiveWidget />
          </div>
        </div>
        <Suspense fallback={<CardsSkeleton />}>
          <Chart />
        </Suspense>
      </div>

      <div className="mt-6">
        <Suspense key={query} fallback={<MapSkeleton />}>
          <DashboardMap query={query} />
        </Suspense>
      </div>
    </main>
  );
}
