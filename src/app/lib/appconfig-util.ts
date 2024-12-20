import axios from 'axios';
const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

export async function fetchAppConfig(idToken: string, configKey: string,) {
    const grafanaUrl = await
        axios.get(`${nodeServerUrl}/node/api/appconfig/search?configKey=${configKey}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`,
                },
            }
        ); //TODO Add orgId
    const url = grafanaUrl.data;
    // console.log(`url fetched:`, url.configValue);
    return url.configValue;
}