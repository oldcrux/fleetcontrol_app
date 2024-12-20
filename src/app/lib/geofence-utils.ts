
import axios from 'axios';
import { Geofence } from './types';
// import { logInfo } from './logger.ts';

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

export async function createGeofence(idToken: string, geofenceDataToSave: string) {

  // console.log(`Geofence data to save: ${geofenceDataToSave}`);

  if (geofenceDataToSave.length > 0) {
    // console.log(`geofenceutils:createGeofence: creating geofence ${JSON.stringify(geofenceDataToSave)}`, geofenceDataToSave);
    const response = await axios.post(`${nodeServerUrl}/node/api/geofence/create`, geofenceDataToSave,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
    console.log(response);
    const status = response.status;
  }
}

export async function updateGeofence(idToken: string, geofenceDataToSave: any) {

  console.log(`Geofence data to save:`, geofenceDataToSave);
  // console.log(`geofenceutils:updateGeofence: updating geofence ${JSON.stringify(geofenceDataToSave)}`, geofenceDataToSave);
  const response = await axios.post(`${nodeServerUrl}/node/api/geofence/update`, geofenceDataToSave,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
  // console.log(response);
  const status = response.status;
}

export async function searchGeofence(idToken: string, orgId: string, encodedViewport: string, query: string) {
  // console.log(`geofenceutils:searchGeofence: searching ${encodedViewport}`);
  const response = await axios.get(`${nodeServerUrl}/node/api/geofence/search?orgId=${orgId}&encodedViewport=${encodedViewport}&vehicles=${query}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
  return response.data;
}

export async function fetchGeofence(idToken: string, orgId: string, query: string) {
  // console.log(`geofenceutils:searchGeofence: searching ${query}`);
  const response = await axios.get(`${nodeServerUrl}/node/api/geofence/search?orgId=${orgId}&${query}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
  // console.log(`geofenceutils:searchGeofence: searching`, response.data);
  return response.data;
}

export async function deleteGeofenceLocation(idToken: string, userId: string, orgId: string, locationTag: string, id: string) {
  const payload = {
    userId: userId,
    orgId: orgId,
    tag: locationTag,
    id: id,
  }
  const response = await axios.post(`${nodeServerUrl}/node/api/geofence/delete`, payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
  return response.data;
}

export async function deleteGeofenceLocationById(idToken: string, orgId: string, id: string) {
  const payload = {
    orgId: orgId,
    id: id
  }
  const response = await axios.post(`${nodeServerUrl}/node/api/geofence/delete/id`, payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
  return response.data;
}

export async function fetchGeofenceGroups(idToken: string, orgId: string) {
  const response = await axios.get(`${nodeServerUrl}/node/api/geofence/group/distinct/search?orgId=${orgId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
  return response.data;
}

export async function bulkCreateGeofences(idToken: string, geofences: any) {
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
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
    console.log(`bulkCreateGeofences: response received`, response);
    const status = response.status;
  }
}