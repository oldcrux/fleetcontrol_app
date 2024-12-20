import axios from 'axios';
import { Vendor } from './types';
const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

export async function createVendor(idToken: string, orgId: string, userId: string, vendor: Vendor) {
    vendor.primaryOrgId = orgId;
    vendor.createdBy = userId
    // console.log(`create vendor data ${JSON.stringify(vendor)}`);
    const response = await axios.post(`${nodeServerUrl}/node/api/vendor/create`, vendor, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.status;
  }
  
  export async function updateVendor(idToken: string, orgId: string, vendor: Vendor) {
    // console.log(`updating vehicle data ${JSON.stringify(vehicle)}`);
    // vendor.orgId = orgId;
    const response = await axios.post(`${nodeServerUrl}/node/api/vendor/update`, vendor, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.status;
  }
  
  export async function searchVendor(idToken: string, orgId: string, query: string, currentPage: number) {
    try {
      // console.log(`vehicleutils:searchVehicle: query String ${query}`);
      const response = await axios.get(`${nodeServerUrl}/node/api/vendor/search?orgId=${orgId}&query=${query}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
  
      // console.log(`vehicleutils:searchVehicle: response received ${JSON.stringify(response.data)}`);
      const allVehicle = response.data;
      return allVehicle;
    } catch (error) {
      console.log(error);
    }
  }

  export async function fetchVendorNames(idToken: string, orgId: string) {
    const response = await axios.get(`${nodeServerUrl}/node/api/vendor/names?orgId=${orgId}`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      // withCredentials: true,
    });
    // console.log(`vendors fetched: `, response.data);
    return response.data;
  }

  export async function deleteVendor(idToken: string, userId: string, orgId: string, vendorId: String) {
    const vendor = {
      userId: userId,
      primaryOrgId: orgId,
      orgId: vendorId
    }
    const response = await axios.post(`${nodeServerUrl}/node/api/vendor/delete`, vendor, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
    return response.status;
  }
  

  