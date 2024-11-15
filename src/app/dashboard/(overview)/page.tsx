"use client"
import { Suspense, useEffect, useState } from "react";
import {
  CardsSkeleton,
  MapSkeleton,
} from "@/app/ui/skeletons";
import DashboardMap from "@/app/ui/dashboard/dashboard-map";
import Search from "@/app/ui/search";
import Chart from "@/app/ui/dashboard/chart";


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
          <Chart/>
        </Suspense>
        {/* <div className="mt-4 flex items-center justify-between gap-2 md:mt-48">
          <Search placeholder="Search Vehicles... TODO" />
        </div> */}
      </div>
      <div className="mt-6">
        <Suspense key={query} fallback={<MapSkeleton />}>
          <DashboardMap query={query}/>
        </Suspense>
      </div>
    </main>
  );
}
