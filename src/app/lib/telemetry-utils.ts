
import axios from 'axios';
import { Geofence } from './types';
// import { logInfo } from './logger.ts';

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

export async function latestVehicleTelemetryReport(orgId: string) {
  const response = await axios.get(`${nodeServerUrl}/node/api/vehicleTelemetryData/vehicle/report/download?orgId=${orgId}`);

//   console.log(`telemetryutils:latestVehicleTelemetryReport: report fetched`, response.data);
  return response.data;
}