"use client";
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    // Id?: string;
    userId?:string;
    role?:string;
    primaryOrgId?: string;
    secondaryOrgId?: string;
    orgLatitude?: string;
    orgLongitude?: string;
    id?: string;
    name?: string | null;
    email?: string | null;
    emailVerified?: Date | null;
    image?: string | null;
  }

  interface Session {
    user: User;
    token: any;
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

export type Geofence = {
  geofenceType: string;
  radius: string;
  lat?: number;
  lng?: number;
  center?: {
    lat: number;
    lng: number;
  };
};

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
  timestamp: string,
}

export interface Shape{
  type: string,
  path?: any[],
  center?: google.maps.LatLng,
  radius: number,
  tag?: string,
  overlay?: any,
  id:string,
}

export interface Vendor {
  orgId: string;
  primaryOrgId: string;
  organizationName: string;
  primaryContactName: string;
  primaryPhoneNumber: string;
  primaryEmail: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  createdBy: string;
}

export interface User {
  // Id?: string;
  userId:string;
  authType:string;
  password:string;
  role:string;
  primaryOrgId: string;
  secondaryOrgId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
  createdBy: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  isActive: boolean;
}