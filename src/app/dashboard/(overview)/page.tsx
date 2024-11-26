"use client";
import { Suspense, useEffect, useState } from "react";
import { CardsSkeleton, MapSkeleton } from "@/app/ui/skeletons";
import DashboardMap from "@/app/ui/dashboard/dashboard-map";
import Search from "@/app/ui/search";
import Chart from "@/app/ui/dashboard/chart";
import { Tooltip } from "@mui/material";

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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <Chart />
        </Suspense>
        {/* <Tooltip
          title="Search by VehicleNumber, Owner or VehicleGroup"
          arrow
          placement="top"
        >
          <div className="absolute top-4 right-10">
            <Search placeholder="Search Vehicles..." />
          </div>
        </Tooltip> */}
      </div>
      <div className="mt-6">
        <Suspense key={query} fallback={<MapSkeleton />}>
          <DashboardMap query={query} />
        </Suspense>
      </div>
    </main>
  );
}
