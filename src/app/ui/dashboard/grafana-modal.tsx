import { fetchAppConfig } from "@/app/lib/vehicle-utils";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { useSession } from "next-auth/react";

// Register necessary chart components and annotation plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface GrafanaProps {
  url: any;
}

// interface ChartData {
//   labels: string[];
//   datasets: {
//     label: string;
//     data: number[];
//     borderColor: string;
//     backgroundColor: string;
//     fill: boolean;
//     tension: number;
//     borderDash?: number[];
//   }[];
// }

const GrafanaModal: React.FC<GrafanaProps> = ({ url }) => {
  //   const [url, setUrl] = useState('');
  //   const { data: session, status } = useSession();
  // const orgId = session?.user?.orgId;

// useEffect(() => {
//     const fetchUrl = async () => {
//       try {
//         const fetchedUrl = await fetchAppConfig('grafanaDashboard1');
//         // console.log(`useEffect: url fetched: ${fetchedUrl}`);
//         setUrl(fetchedUrl);
//       } catch (error) {
//         // console.error('Error fetching URL:', error);
//       }
//     };

//     fetchUrl();
//   }, []);

//   const queryString =
//     typeof vehicleNumber === 'string'
//       ? `&var-vehicleNumber=${vehicleNumber}`
//       : vehicleNumber.map((num:any) => `&var-vehicleNumber=${num}`).join('');

//   const finalUrl = `${url}${orgId}${queryString}`;
  console.log(`final url formed:`,url);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {url ? (
        <iframe src={url} width="100%" height="100%" style={{ border: 'none' }} />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default GrafanaModal;
