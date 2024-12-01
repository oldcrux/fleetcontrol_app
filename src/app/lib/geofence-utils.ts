
import axios from 'axios';
import { Geofence } from './types';
// import { logInfo } from './logger.ts';

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

export async function createGeofence(geofenceDataToSave: string) {
  
  // console.log(`Geofence data to save: ${geofenceDataToSave}`);

  if (geofenceDataToSave.length > 0) {
    // console.log(`geofenceutils:createGeofence: creating geofence ${JSON.stringify(geofenceDataToSave)}`, geofenceDataToSave);
    const response = await axios.post(`${nodeServerUrl}/node/api/geofence/create`, geofenceDataToSave, {
      headers: {
        'Content-Type': 'application/json'
      },
    });
    console.log(response);
    const status = response.status;
  }
}

export async function searchGeofence(orgId: string, encodedViewport: string, query: string) {
  // console.log(`geofenceutils:searchGeofence: searching ${encodedViewport}`);
  const response = await axios.get(`${nodeServerUrl}/node/api/geofence/search?orgId=${orgId}&encodedViewport=${encodedViewport}&vehicles=${query}`);
  return response.data;
}

export async function deleteGeofenceLocation(orgId: string, locationTag: string) {
  const payload={
    orgId: orgId, // TODO remove hardcoding
    tag: locationTag
  }
  const response = await axios.post(`${nodeServerUrl}/node/api/geofence/delete`, payload);
  return response.data;
}

export async function geofenceGroups(orgId: string){
  const response = await axios.get(`${nodeServerUrl}/node/api/geofence/group/distinct/search?orgId=${orgId}`);
  return response.data;
}

export async function bulkCreateGeofences(geofences: any) {
  if (geofences.length > 0) {
    const finalGeofences = geofences.map((item: Geofence) => {
      if (item.geofenceType === "circle" && item.lat !== undefined && item.lng !== undefined) {
        const { lat, lng, ...rest } = item;
        return {
          ...rest,
          center: {
            lat: item.lat,
            lng: item.lng
          }
        };
      }
      return item;
    });

    // console.log(`geofenceutils:createGeofence: final geofence ${JSON.stringify(finalGeofences)}`, finalGeofences);
    const response = await axios.post(`${nodeServerUrl}/node/api/geofence/create`, finalGeofences, {
      headers: {
        'Content-Type': 'application/json'
      },
    });
    console.log(`bulkCreateGeofences: response received`, response);
    const status = response.status;
  }
}