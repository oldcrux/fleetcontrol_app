"use client";
import React, { ReactNode } from 'react';
import { APIProvider } from "@vis.gl/react-google-maps";

interface GoogleMapProviderProps {
  children: ReactNode;
}

const GoogleMapProvider: React.FC<GoogleMapProviderProps> = ({ children }) => {
  return (
    <APIProvider apiKey={`${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}`}>
      {children}
    </APIProvider>
  );
};
export default GoogleMapProvider;
