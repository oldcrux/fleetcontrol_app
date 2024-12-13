import axios from 'axios';
import { User } from './types';
const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

export async function createUser(orgId: string, userId: string, user: User) {
    console.log(`create user data ${JSON.stringify(user)}`);
    if(user.primaryOrgId !== orgId){
        user.secondaryOrgId=orgId;
        user.role='view';
    }
    // user.primaryOrgId = orgId;
    user.createdBy = userId
    
    const response = await axios.post(`${nodeServerUrl}/node/api/user/create`, user, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.status;
  }
  
  export async function updateUser(orgId: string, user: User) {
    // console.log(`updating vehicle data ${JSON.stringify(vehicle)}`);
    // user.orgId = orgId;
    const response = await axios.post(`${nodeServerUrl}/node/api/user/update`, user, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.status;
  }
  
  export async function updatePassword(orgId: string, user: User) {
    // console.log(`updating vehicle data ${JSON.stringify(vehicle)}`);
    // user.orgId = orgId;
    const response = await axios.post(`${nodeServerUrl}/node/api/user/update`, user, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.status;
  }

  export async function searchUser(orgId: string, query: string, currentPage: number) {
    try {
      // console.log(`vehicleutils:searchVehicle: query String ${query}`);
      const response = await axios.get(`${nodeServerUrl}/node/api/user/search?orgId=${orgId}&query=${query}`);
  
      // console.log(`vehicleutils:searchVehicle: response received ${JSON.stringify(response.data)}`);
      const allVehicle = response.data;
      return allVehicle;
    } catch (error) {
      console.log(error);
    }
  }

  export async function fetchUser(orgId: string, query: string, currentPage: number) {
    try {
      // console.log(`vehicleutils:searchVehicle: query String ${query}`);
      const response = await axios.get(`${nodeServerUrl}/node/api/user/fetch?orgId=${orgId}&query=${query}`);
  
      // console.log(`vehicleutils:searchVehicle: response received ${JSON.stringify(response.data)}`);
      const allVehicle = response.data;
      return allVehicle;
    } catch (error) {
      console.log(error);
    }
  }

  export async function deleteUser(userId: string, orgId: string, loggedInUserId: String) {
    const user = {
      userId: userId,
      secondaryOrgId: orgId,
      deletedBy: loggedInUserId
    }
    const response = await axios.post(`${nodeServerUrl}/node/api/user/delete`, user, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.status;
  }
  

  export async function activateUser(orgId: string, user: User) {
    // console.log(`updating vehicle data ${JSON.stringify(vehicle)}`);
    // user.orgId = orgId;
    const response = await axios.post(`${nodeServerUrl}/node/api/user/update`, user, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.status;
  }
 

  export async function deActivateUser(orgId: string, user: User) {
    // console.log(`updating vehicle data ${JSON.stringify(vehicle)}`);
    // user.orgId = orgId;
    const response = await axios.post(`${nodeServerUrl}/node/api/user/update`, user, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.status;
  }
