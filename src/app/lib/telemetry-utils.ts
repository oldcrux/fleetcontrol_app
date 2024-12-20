
import axios from 'axios';
import { Geofence } from './types';
// import { logInfo } from './logger.ts';

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

export async function latestVehicleTelemetryReport(idToken: string, orgId: string) {
  console.log(`telemetryutils:latestVehicleTelemetryReport: generating report for orgId:`, orgId);
  const response = await axios.get(`${nodeServerUrl}/node/api/vehicleTelemetryData/vehicle/report/download?orgId=${orgId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });

  //   console.log(`telemetryutils:latestVehicleTelemetryReport: report fetched`, response.data);
  return response.data;
}