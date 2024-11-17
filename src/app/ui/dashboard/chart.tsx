"use client";
import { Pie, Bar } from "react-chartjs-2";
import { useState, useEffect } from "react";
import Modal from "react-modal";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from "chart.js";

import { getVehicleCounts } from "@/app/lib/vehicle-utils";
import VehicleModal from "./vehicle-modal";
import { useSession } from "next-auth/react";
import CloseIcon from "@mui/icons-material/Close";

// Register the necessary components
// ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

interface ChartData {
  label: string;
  value: number;
  color: string;
}

// const initialData = [
//   { label: "Total", value: 0, color: "#FF6384" },
//   { label: "Running", value: 0, color: "#36A2EB" },
//   { label: "Idle", value: 0, color: "#FFCE56" },
// ];

export default function Chart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<ChartData>();
  const { data: session, status } = useSession();
  const orgId = session?.user?.orgId;

  useEffect(() => {
    let eventSource: any;
    const fetchVehicleCounts = async () => {
      try {
        // console.log(`session status: ${status}`);
        // console.log(`orgId fetched from session: ${orgId}`);
        const allVehicleCount = await getVehicleCounts(orgId as string);
        // console.log(`all vehicle count fetched - ${allVehicleCount}`);
        // console.log("checking type of - " + typeof allVehicleCount);
        // setallVehicleCountData(allVehicleCount);

        // console.log(`reading session variables: ${orgId}`);
        eventSource = new EventSource(
          `${nodeServerUrl}/node/api/vehicleTelemetryData/fetchRunningCountSSE?orgId=${orgId}`
        ); // Connect to SSE endpoint

        eventSource.onmessage = (event: { data: string }) => {
          const runningVehicleCount = JSON.parse(event.data);
          // console.log(`chart:fetchVehicleCounts: new running vehicle count=> ${event.data}`);
          let idleVehicleCount = allVehicleCount - runningVehicleCount;
          setData([
            { label: "Running", value: runningVehicleCount, color: "#4ade80" },
            { label: "Idle", value: idleVehicleCount, color: "#9ca3af" },
          ]);
        };
      } catch (error) {
        console.error("Error fetching vehicle counts:", error);
      }
    };
    fetchVehicleCounts();

    //TODO this eventSource is not getting closed.  Even though it gets closed in the map.
    return () => {
      if (eventSource) {
        eventSource.close();
        console.log("chart SSE connection closed");
      }
    };
  }, []);

  const chartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: 'Vehicles',
        data: data.map((item) => item.value),
        backgroundColor: data.map((item) => item.color),
        // borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        borderRadius: 15,
      },
    ],
  };

  const pieChartOptions = {
    onClick: (event: any, elements: any) => {
      // console.log(`onclick: ${elements[0]}`);
      if (elements.length > 0) {
        const index = elements[0].index;
        setSelectedData(data[index]);
        setModalIsOpen(true);
      }
    },
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#ffffff',
        },
      },
      y: {
        ticks: {
          color: (context) => {
            const label = context.tick.label;
            if (label === 'Running') {
              return '#4ade80';
            } else if (label === 'Idle') {
              return '#9ca3af';
            }
          },
        },
      }
    },
    onClick: (event: any, elements: any) => {
      // console.log(`onclick: ${elements[0]}`);
      if (elements.length > 0) {
        const index = elements[0].index;
        setSelectedData(data[index]);
        setModalIsOpen(true);
      }
    },
  };

  return (
    <div>
      {/* <Pie data={chartData} options={pieChartOptions} /> */}
      <Bar data={chartData} options={barChartOptions}/>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Detail"
        ariaHideApp={false}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)", // Optional: Adjust overlay background color
          },
          content: {
            // You can leave content styles empty if using Tailwind classes
          },
        }}
      >
        <div className="absolute top-1 right-1 mr-2 mt-2">
          <button
            className="absolute top-1 right-1 -mr-3 -mt-3 z-30 text-black rounded-full w-5 h-5 flex items-center justify-center"
            onClick={() => setModalIsOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>
        <VehicleModal label={selectedData?.label}></VehicleModal>
      </Modal>
    </div>
  );
}
