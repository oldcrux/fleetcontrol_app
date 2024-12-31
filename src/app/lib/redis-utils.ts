import axios from 'axios';
const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

export async function reportGenerationProgress(idToken: string, orgId: string) {  
  const progress = await
    axios.get(`${nodeServerUrl}/node/api/redis/inspect/reportGenerationProgress?orgId=${orgId}`, 
      {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });
  const reportProgress = progress.data;
  return reportProgress;
}
