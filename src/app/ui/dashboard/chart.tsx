"use client";
// import { fetchEventSource } from "@microsoft/fetch-event-source";
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
  ChartOptions,
} from "chart.js";

import { getVehicleCounts } from "@/app/lib/vehicle-utils";
import VehicleModal from "./vehicle-modal";
import { useSession } from "next-auth/react";
import CloseIcon from "@mui/icons-material/Close";
import {
  ghost_vehicle_color,
  idle_vehicle_color,
  off_vehicle_color,
  running_vehicle_color,
  speeding_vehicle_color,
} from "../util/color_picker";
import axios from "axios";

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
const controller = new AbortController();
const signal = controller.signal;

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
  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId
    ? session?.user?.secondaryOrgId
    : session?.user?.primaryOrgId;
  const vendorId = session?.user?.secondaryOrgId
    ? session?.user?.primaryOrgId
    : "";

  useEffect(() => {
    // let eventSource: any;
    let path = `/node/api/vehicleTelemetryData/fetchRunningCountSSE?orgId=${orgId}&vendorId=${vendorId}`;
    const url = new URL(path, nodeServerUrl);
    const fetchVehicleCounts = async () => {
      try {
        // console.log(`session Use: `, session?.user);
        // console.log(`session status: `, session?.token.accessToken);
        // console.log(`orgId fetched from session: ${orgId}`);
        // const allVehicleCount = await getVehicleCounts(
        //   session?.token.idToken,
        //   orgId as string,
        //   vendorId as string
        // );
        // console.log(`all vehicle count fetched - ${allVehicleCount}`);

        const response = await axios.get(`${url}`, {
          headers: {
            Authorization: `Bearer ${session?.token.idToken}`,
          },
          // withCredentials: true,
        });
        const runningVehicles = await response.data;
        console.log(`chart:fetchVehicleCounts: data:`, runningVehicles);
        if (runningVehicles) {
          // const runningVehicles = eventData;
          // console.log(`chart:fetchVehicleCounts: new running vehicle count=> ${eventData.data}`);
          let totalGhostCount = runningVehicles.ghostVehicleCount;
          setData([
            {
              label: "Ghost",
              value: totalGhostCount,
              color: ghost_vehicle_color,
            },
            {
              label: "Off",
              value: runningVehicles.ignitionOffVehiclesCount,
              color: off_vehicle_color,
            },
            {
              label: "Idle",
              value: runningVehicles.idleVehiclesCount,
              color: idle_vehicle_color,
            },
            {
              label: "Running",
              value: runningVehicles.runningVehiclesCount,
              color: running_vehicle_color,
            },
            {
              label: "Speeding",
              value: runningVehicles.speedingVehiclesCount,
              color: speeding_vehicle_color,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching vehicle counts:", error);
      }
    };
    fetchVehicleCounts();
    const interval = setInterval(fetchVehicleCounts, 10000);
    return () => clearInterval(interval);

    //TODO this is not working. The connection is not getting closed when navigating away from dashboard
    // return () => {
    //   controller.abort();
    //   console.log("chart SSE connection closed");
    // };
  }, []);

  const chartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        label: "Vehicles",
        data: data.map((item) => item.value),
        backgroundColor: data.map((item) => item.color),
        // borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        borderRadius: 15,
      },
    ],
  };

  // const pieChartOptions = {
  //   onClick: (event: any, elements: any) => {
  //     // console.log(`onclick: ${elements[0]}`);
  //     if (elements.length > 0) {
  //       const index = elements[0].index;
  //       setSelectedData(data[index]);
  //       setModalIsOpen(true);
  //     }
  //   },
  // };

  const barChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const label = tooltipItem.label;
            const dataValue = tooltipItem.raw;

            // Customize the tooltip label based on the bar's label
            if (label === "Ghost") {
              return `Vehicle that has not sent data in last 24hr: ${dataValue}`;
            } else if (label === "Off") {
              return `Vehicle engine turned off: ${dataValue}`;
            } else if (label === "Idle") {
              return `Vehicle engine is on, but not running: ${dataValue}`;
            } else if (label === "Running") {
              return `Vehicle moving at speed <=45 kmph: ${dataValue}`; //TODO remove speed hardcoding
            } else if (label === "Speeding") {
              return `Vehicle speeding at >45 kmph: ${dataValue}`; //TODO remove speed hardcoding
            }

            // Default tooltip for other labels
            return `${label}: ${dataValue}`;
          },
        },
      },
    },
    indexAxis: "y",
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: "#ffffff",
        },
      },
      y: {
        ticks: {
          color: (context) => {
            const label = context.tick.label;
            if (label === "Ghost") {
              return ghost_vehicle_color;
            } else if (label === "Off") {
              return off_vehicle_color;
            } else if (label === "Idle") {
              return idle_vehicle_color;
            } else if (label === "Running") {
              return running_vehicle_color;
            } else if (label === "Speeding") {
              return speeding_vehicle_color;
            }
          },
        },
      },
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
      <Bar data={chartData} options={barChartOptions} />
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
            // Leave content styles empty if using Tailwind classes
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
