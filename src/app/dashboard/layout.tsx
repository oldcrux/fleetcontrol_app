"use client";
import React from "react";
import SideNav from "@/app/ui/dashboard/sidenav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-blend-lighten">
      <SideNav />
      <div className="flex-grow p-2 md:overflow-y-auto md:p-2 mr-2">
        {children}
      </div>
    </div>
  );
}
