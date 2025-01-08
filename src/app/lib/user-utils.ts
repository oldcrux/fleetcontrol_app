import axios from 'axios';
import { User } from './types';
const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

export async function createUser(idToken: string, orgId: string, userId: string, user: User) {
  // console.log(`create user data ${JSON.stringify(user)}`);
  if (user.primaryOrgId !== orgId) {
    user.secondaryOrgId = orgId;
    user.role = 'view';
  }
  // user.primaryOrgId = orgId;
  user.createdBy = userId

  if (user.authType = 'others') {
    user.password = undefined;
  }
  const response = await axios.post(`${nodeServerUrl}/node/api/user/create`, user, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}

export async function updateUser(idToken: string, orgId: string, user: User) {
  // console.log(`updating vehicle data ${JSON.stringify(vehicle)}`);
  // user.orgId = orgId;
  const response = await axios.post(`${nodeServerUrl}/node/api/user/update`, user, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}

export async function updatePassword(idToken: string, user: any) {
  // console.log(`updating user data ${JSON.stringify(user)}`);
  // user.orgId = orgId;
  const response = await axios.post(`${nodeServerUrl}/node/api/user/updatePassword`, user, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}

export async function searchUser(idToken: string, orgId: string, query: string, currentPage: number) {
  try {
    // console.log(`vehicleutils:searchVehicle: query String ${query}`);
    const response = await axios.get(`${nodeServerUrl}/node/api/user/search?orgId=${orgId}&query=${query}`, {
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

export async function fetchUser(idToken: string, orgId: string, query: string, currentPage: number) {
  try {
    // console.log(`vehicleutils:searchVehicle: query String ${query}`);
    const response = await axios.get(`${nodeServerUrl}/node/api/user/fetch?orgId=${orgId}&query=${query}`, {
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

export async function deleteUser(idToken: string, userId: string, orgId: string, loggedInUserId: String) {
  const user = {
    userId: userId,
    secondaryOrgId: orgId,
    deletedBy: loggedInUserId
  }
  const response = await axios.post(`${nodeServerUrl}/node/api/user/delete`, user, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}


export async function activateUser(idToken: string, orgId: string, user: User) {
  // console.log(`updating vehicle data ${JSON.stringify(vehicle)}`);
  // user.orgId = orgId;
  const response = await axios.post(`${nodeServerUrl}/node/api/user/update`, user, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}


export async function deActivateUser(idToken: string, orgId: string, user: User) {
  // console.log(`updating vehicle data ${JSON.stringify(vehicle)}`);
  // user.orgId = orgId;
  const response = await axios.post(`${nodeServerUrl}/node/api/user/update`, user, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });
  return response.status;
}
