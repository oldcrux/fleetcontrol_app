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

interface VehicleProps {
  vehicleNumber: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    tension: number;
    borderDash?: number[];
  }[];
}

const SpeedChart: React.FC<VehicleProps> = ({ vehicleNumber }) => {
    const [url, setUrl] = useState('');

//   const timeZone = 'Asia/Kolkata';
//   useEffect(() => {
//     const fetchSpeed = async () => {
//       const speedValues = await fetchVehicleSpeed(vehicleNumber);
//       console.log(
//         `speed-chart:useEffect: speed fetched: ${JSON.stringify(speedValues)}`
//       );

//       const timestamps = speedValues.map((entry: any) =>
//         new Date(entry.timestamp).toLocaleString('en-US', {
//             timeZone: timeZone, // Specify the timezone
//           })
//       );
//       const speeds = speedValues.map((entry: any) => entry.speed);

//       // Set the borderDash property for zero value portions
//       const borderDashArray = speeds.map((speed: any) =>
//         speed === 0 ? [5, 5] : []
//       ); // [5,5] creates a dotted line

//       setChartData({
//         labels: timestamps,
//         datasets: [
//           {
//             label: "Speed",
//             data: speeds,
//             borderColor: "rgba(75,192,192,1)",
//             backgroundColor: "rgba(75,192,192,0.2)",
//             fill: true, // Area chart (line with fill)
//             tension: 0.4, // Adds some smoothness to the curve
//             borderDash: borderDashArray, // Apply dotted lines for 0 value portions
//           },
//         ],
//       });
//     };

//     fetchSpeed().catch(console.error);
//   }, [vehicleNumber]);

//   if (!chartData) {
//     return <div>Loading...</div>;
//   }

  // Chart options to draw the horizontal line at y = 10
//   const options: ChartOptions<"line"> = {
//     responsive: true,
//     plugins: {
//       legend: {
//         display: false,
//       },
//       annotation: {
//         annotations: {
//           line1: {
//             type: "line",
//             yMin: 40, // Horizontal line at y = 10
//             yMax: 40, // Keep the line at the same height
//             borderColor: "#ef4444", // Red color for the line
//             borderWidth: 2,
//             label: {
//               content: "Threshold",
//               position: "center",
//               font: {
//                 size: 14,
//                 weight: "bold",
//               },
//             },
//           },
//         },
//       },
//     },
//     scales: {
//       x: {
//         type: "category", // Use category scale for x axis (timestamps)
//       },
//       y: {
//         type: "linear", // Use linear scale for y axis (speed values)
//         beginAtZero: true, // Optional: ensures y-axis starts from 0
//       },
//     },
//   };


useEffect(() => {
    const fetchUrl = async () => {
      try {
        const fetchedUrl = await fetchAppConfig('grafanaDashboard1');
        console.log(`useEffect: url fetched: ${fetchedUrl}`);
        setUrl(fetchedUrl);
      } catch (error) {
        console.error('Error fetching URL:', error);
      }
    };

    fetchUrl();
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {url ? (
        <iframe src={url} width="100%" height="100%" style={{ border: 'none' }} />
      ) : (
        <p>Loading...</p> // You can show a loading message while the URL is being fetched
      )}
    </div>
  );
};

export default SpeedChart;


