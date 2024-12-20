import axios from 'axios';
// import { getSession } from 'next-auth/react';
import { Vehicle } from './types';

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

// interface Vehicle {
//   vehicleNumber: string;
//   make: string;
//   model: string;
//   owner: string;
//   primaryPhoneNumber: string;
//   secondaryPhoneNumber: string;
//   serialNumber: string;
//   geofenceLocationGroupName: string;
//   vehicleGroup: string;
//   orgId: string
// }

export async function bulkCreateVehicle(idToken: string, vehicles: any) {
  console.log(`create vehicle data `, vehicles);
  const response = await axios.post(`${nodeServerUrl}/node/api/vehicle/bulkCreate`, vehicles, 
    {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}

export async function createVehicle(idToken: string, orgId: string, userId: string, vehicle: Vehicle) {
  // console.log(`create vehicle data ${JSON.stringify(data)}`);
  vehicle.orgId = orgId;
  vehicle.createdBy = userId;
  if(vehicle.geofenceLocationGroupName && vehicle.geofenceLocationGroupName === 'None'){
    vehicle.geofenceLocationGroupName = "";
  }
  
  const response = await axios.post(`${nodeServerUrl}/node/api/vehicle/create`, vehicle, 
    {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}

export async function updateVehicle(idToken: string, orgId: string, vehicle: Vehicle) {
  // console.log(`updating vehicle data ${JSON.stringify(vehicle)}`);
  vehicle.orgId = orgId;

  if(vehicle.geofenceLocationGroupName && vehicle.geofenceLocationGroupName === 'None'){
    vehicle.geofenceLocationGroupName = "";
  }
  const response = await axios.post(`${nodeServerUrl}/node/api/vehicle/update`, vehicle, 
    {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}

export async function searchVehicle(idToken: string, orgId: string, query: string, currentPage: number) {

  // const orgId = 'bmc'; //TODO remove hardcoding
  try {
    // console.log(`vehicleutils:searchVehicle: query String ${query}`);
    const response = await axios.get(`${nodeServerUrl}/node/api/vehicle/search?orgId=${orgId}&query=${query}`, 
      {
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

export async function searchVehicleByNumber(idToken: string, orgId: string, vehicleNumber: string) {
  try {
    // console.log(`vehicleutils:searchVehicle: query String ${query}`);
    const response = await axios.get(`${nodeServerUrl}/node/api/vehicle/search/vehicleNumber?orgId=${orgId}&vehicleNumber=${vehicleNumber}`, 
      {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
    // console.log(`vehicleutils:searchVehicleByNumber: response received ${JSON.stringify(response.data)}`);
    const vehicle = response.data;
    return vehicle[0];
  } catch (error) {
    console.log(error);
  }
}

export async function deleteVehicle(idToken: string, userId: string, orgId: string, vehicleNumber: String) {
  // console.log(`updating vehicle data ${JSON.stringify(vehicle)}`);
  // vehicle.orgId='bmc';
  const vehicle = {
    userId: userId,
    orgId: orgId,
    vehicleNumber: vehicleNumber
  }
  const response = await axios.post(`${nodeServerUrl}/node/api/vehicle/delete`, vehicle, 
    {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}

/** First API to fetch all the reports with reportName and touchedAllLocation Flag for the organization */
export async function fetchVehicleRunningReportGroupByReportName(idToken: string, orgId: string, query: string, currentPage: number,) {

  // const orgId = 'bmc'; //TODO remove hardcoding
  try {
    // console.log(`vehicleutils:fetchVehicleRunningReportGroupByReportName: query String ${JSON.parse(query)}`);
    const response = await axios.get(`${nodeServerUrl}/node/api/vehicleTelemetryData/report/nameAndVehicle?orgId=${orgId}`, 
      {
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

export async function fetchVehicleRunningReportGroupByReportNameVehicleNumber(idToken: string, orgId: string, query: string) {
  try {
    // console.log(`vehicleutils:searchVehicle: query String ${query}`);
    const response = await axios.get(`${nodeServerUrl}/node/api/vehicleTelemetryData/report/nameAndVehicle?orgId=${orgId}&query=${query}`, 
      {
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

// export async function fetchVehicleRunningReport(query: string, currentPage: number,) {
export async function fetchVehicleRunningReport(idToken: string, orgId: string, query: string) {
  try {
    // console.log(`vehicleutils:searchVehicle: query String ${query}`);
    const response = await axios.get(`${nodeServerUrl}/node/api/vehicleTelemetryData/report?orgId=${orgId}&query=${query}`, 
      {
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


// Fetching all vehicle telemetry details
export async function fetchAllVehicleTelemetryData() {

  // const currentOrganizationVehicles = {
  //   "orgId": "bmc", // TODO remove hardcoding
  // };

  // try {
  //   const response = await axios.post(`${nodeServerUrl}/api/vehicleTelemetryData/fetchAll`, currentOrganizationVehicles);
  //   const currentOrgVehicleData = response.data;

  //   return currentOrgVehicleData;
  // } catch (error) {
  //   console.log(error);
  // }
}

// In Use
export async function getVehicleCounts(idToken: string, orgId: string, vendorId: string) {

  const allData = await
    axios.get(`${nodeServerUrl}/node/api/vehicle/count?orgId=${orgId}&vendorId=${vendorId}`, 
      {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    }); // Fetching all vehicle count

  const allVehicleCount = parseInt(allData.data)
  // console.log(`data:getVehicleCounts: all vehicle count == ${allVehicleCount} `);
  return allVehicleCount;
}


export async function getRunningVehicleCountSSE(idToken: string, orgId: string, vendorId: string) {
  // console.log(`vehicleutils:getRunningVehicleCountSSE: Entering with orgId ${orgId}`)
  const runningResponse = await
    axios.get(`${nodeServerUrl}/node/api/vehicleTelemetryData/fetchRunningCountSSE?orgId=${orgId}&vendorId=${vendorId}`, 
      {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    }); // Fetching running vehicle count from questdb

  // console.log(`all vehicle count ${allResponse.data.size} and running vehicles count ${runningResponse.data}`);
  // const allVehicleCount = allResponse.data.size;
  const runningVehicleCount = runningResponse.data;
  // console.log(`running vehicle count ${runningVehicleCount}`);
  // const notRunningVehicleCount = allVehicleCount - runningVehicleCount;

  return runningVehicleCount ;
}


export async function triggerAllReportGeneration(idToken: string, orgId: string) {
  // const session = await getSession();

  // const orgId = session?.user?.secondaryOrgId ? session?.user?.secondaryOrgId : session?.user?.primaryOrgId;
  // console.log(`vehicleutils:triggerAllReportGeneration: Entering with orgId ${orgId}`)
  await axios.get(`${nodeServerUrl}/node/api/job/report/job/create?orgId=${orgId}&queueName=reportGenerationQueue`, 
    {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });
}

export async function fetchGhostVehicles(idToken: string, orgId: string, vendorId: string) {
  // console.log(`vehicleutils:fetchGhostVehicles: Entering with orgId ${orgId}`)
  const response = await
    axios.get(`${nodeServerUrl}/node/api/vehicle/ghost?orgId=${orgId}&vendorId=${vendorId}`, 
      {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
  const offVehicles = response.data;
  // console.log(`vehicleutils:fetchGhostVehicles: response: ${JSON.stringify(idleVehicles)}`)
  return offVehicles;
}

export async function fetchVehiclesIgnitionOff(idToken: string, orgId: string, vendorId: string) {
  
  // console.log(`vehicleutils:fetchVehiclesIgnitionOff: Entering with orgId ${orgId}`)
  const offResponse = await
    axios.get(`${nodeServerUrl}/node/api/vehicle/ignition/off?orgId=${orgId}&vendorId=${vendorId}`, 
      {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
  const offVehicles = offResponse.data;

  // console.log(`vehicleutils:fetchVehiclesIgnitionOff: response: ${JSON.stringify(idleVehicles)}`)
  return offVehicles;
}

export async function fetchAllIdleVehicles(idToken: string, orgId: string, vendorId: string) {
  
  // console.log(`vehicleutils:fetchAllIdleVehicles: Entering with orgId ${orgId}`)
  const idleResponse = await
    axios.get(`${nodeServerUrl}/node/api/vehicle/idle?orgId=${orgId}&vendorId=${vendorId}`, 
      {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
  const idleVehicles = idleResponse.data;

  // console.log(`vehicleutils:fetchAllIdleVehicles: response: ${JSON.stringify(idleVehicles)}`)
  return idleVehicles;
}

export async function fetchAllRunningVehicles(idToken: string, orgId: string, vendorId: string) {
  
  // console.log(`vehicleutils:fetchAllRunningVehicles: Entering with orgId ${orgId}`)
  const idleResponse = await
    axios.get(`${nodeServerUrl}/node/api/vehicle/running?orgId=${orgId}&vendorId=${vendorId}`, 
      {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
  const idleVehicles = idleResponse.data;

  // console.log(`vehicleutils:fetchAllRunningVehicles: response: ${JSON.stringify(idleVehicles)}`)
  return idleVehicles;
}

export async function fetchAllSpeedingVehicles(idToken: string, orgId: string, vendorId: string) {
  
  // console.log(`vehicleutils:fetchAllSpeedingVehicles: Entering with orgId ${orgId}`)
  const idleResponse = await
    axios.get(`${nodeServerUrl}/node/api/vehicle/speeding?orgId=${orgId}&vendorId=${vendorId}`, 
      {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
  const idleVehicles = idleResponse.data;

  // console.log(`vehicleutils:fetchAllSpeedingVehicles: response: ${JSON.stringify(idleVehicles)}`)
  return idleVehicles;
}

export async function fetchVehiclesTravelPath(idToken: string, vehicleNumber: string, ) {
  
  // console.log(`vehicleutils:fetchVehiclesTravelPath: Entering with vehicle Number ${vehicleNumber}`)
  const latlng = await
    axios.get(`${nodeServerUrl}/node/api/vehicleTelemetryData/vehicle/travelpath?vehicleNumber=${vehicleNumber}`, 
      {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
  const latlngs = latlng.data;

  // console.log(`vehicleutils:fetchVehiclesTravelPath: response: ${JSON.stringify(latlngs)}`)
  return latlngs;
}

// export async function fetchVehicleSpeed(vehicleNumber: string, ) {
  
//   // console.log(`vehicleutils:fetchVehicleSpeed: Entering with vehicle Number ${vehicleNumber}`)
//   const speed = await
//     axios.get(`${nodeServerUrl}/node/api/vehicleTelemetryData/vehicle/speed?vehicleNumber=${vehicleNumber}`);
//   const speedValues = speed.data;

//   // console.log(`vehicleutils:fetchVehicleSpeed: response: ${JSON.stringify(speedValues)}`)
//   return speedValues;
// }

