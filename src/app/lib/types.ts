"use client";
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    // Id?: string;
    userId?:string;
    orgId?: string;
    orgLatitude?: string;
    orgLongitude?: string;
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | null;
    image?: string | null
  }

  interface Session {
    user: User;
  }
}

// export type Vehicle = {
//   vehicleNumber: string;
//   make: string;
//   model: string;
//   owner: string;
//   primaryPhoneNumber: number;
//   secondaryPhoneNumber: number;
//   serialNumber: number;
//   geofenceLocationGroupName: string;
//   vehicleGroup: string;
//   orgId: string;
// };


export interface Vehicle {
  vehicleNumber: string;
  make: string;
  model: string;
  owner: string;
  primaryPhoneNumber: string;
  secondaryPhoneNumber: string;
  serialNumber: string;
  geofenceLocationGroupName: string;
  vehicleGroup: string;
  orgId: string,
  createdBy: string,
  isActive: string,
}

export interface Shape{
  type: string,
  path?: any[],
  center?: google.maps.LatLng,
  radius: number,
  name?: string,
  overlay?: any,
}

