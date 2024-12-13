import axios from 'axios';
import { Vendor } from './types';
const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

export async function createVendor(orgId: string, userId: string, vendor: Vendor) {
    vendor.primaryOrgId = orgId;
    vendor.createdBy = userId
    // console.log(`create vendor data ${JSON.stringify(vendor)}`);
    const response = await axios.post(`${nodeServerUrl}/node/api/vendor/create`, vendor, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.status;
  }
  
  export async function updateVendor(orgId: string, vendor: Vendor) {
    // console.log(`updating vehicle data ${JSON.stringify(vehicle)}`);
    // vendor.orgId = orgId;
    const response = await axios.post(`${nodeServerUrl}/node/api/vendor/update`, vendor, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.status;
  }
  
  export async function searchVendor(orgId: string, query: string, currentPage: number) {
    try {
      // console.log(`vehicleutils:searchVehicle: query String ${query}`);
      const response = await axios.get(`${nodeServerUrl}/node/api/vendor/search?orgId=${orgId}&query=${query}`);
  
      // console.log(`vehicleutils:searchVehicle: response received ${JSON.stringify(response.data)}`);
      const allVehicle = response.data;
      return allVehicle;
    } catch (error) {
      console.log(error);
    }
  }

  export async function fetchVendorNames(orgId: string) {
    const response = await axios.get(`${nodeServerUrl}/node/api/vendor/names?orgId=${orgId}`);
    // console.log(`vendors fetched: `, response.data);
    return response.data;
  }

  export async function deleteVendor(userId: string, orgId: string, vendorId: String) {
    const vendor = {
      userId: userId,
      primaryOrgId: orgId,
      orgId: vendorId
    }
    const response = await axios.post(`${nodeServerUrl}/node/api/vendor/delete`, vendor, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.status;
  }
  

  