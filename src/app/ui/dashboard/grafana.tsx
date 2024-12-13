import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import CloseIcon from "@mui/icons-material/Close";

import ReactDOM from "react-dom";
import { useSession } from "next-auth/react";
import { fetchAppConfig } from "@/app/lib/vehicle-utils";
import GrafanaModal from "./grafana-modal";

type JsonPopupProps = {
  show: boolean,
  onClose: () => void,
  vehicleNumbers: string | string[],
  openInNewTab?: boolean;
};


export const Grafana: React.FC<JsonPopupProps> = ({
  show,
  onClose,
  vehicleNumbers,
  openInNewTab = false, // Default to false
}) => {
  
  const [url, setUrl] = useState('');
    const { data: session, status } = useSession();
    const orgId = session?.user?.secondaryOrgId ? session?.user?.secondaryOrgId : session?.user?.primaryOrgId;

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const fetchedUrl = await fetchAppConfig('grafanaDashboard1');
        // console.log(`useEffect: url fetched: ${fetchedUrl}`);
        setUrl(fetchedUrl);
      } catch (error) {
        // console.error('Error fetching URL:', error);
      }
    };

    fetchUrl();
  }, []);

  const queryString =
    typeof vehicleNumbers === 'string'
      ? `&var-vehicleNumber=${vehicleNumbers}`
      : Array.isArray(vehicleNumbers)? vehicleNumbers.map((num:any) => `&var-vehicleNumber=${num}`).join('') : '';

  const finalUrl = `${url}${orgId}${queryString}`;
  
  useEffect(() => {
    if (openInNewTab && show) {
      console.log(`final url in modal:`,finalUrl);
      const newTab = window.open(finalUrl, "_blank");
  
      if (newTab) {
        const interval = setInterval(() => {
          if (newTab.closed) {
            onClose();
            clearInterval(interval);
          }
        }, 500);
      }
    }
  }, [openInNewTab, show]);
  if (openInNewTab) {
    return null;
  }

  return (
    <>
      <Modal
        isOpen={show}
        onRequestClose={onClose}
        // onClose={onClose}
        contentLabel="Detail"
        ariaHideApp={false}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)", // Optional: Adjust overlay background color
          },
          content: {
            // leave content styles empty if using Tailwind classes
          },
        }}
      >
        <div className="absolute top-1 right-1 mr-2 mt-2">
          <button
            className="absolute top-1 right-1 -mr-3 -mt-3 z-30 text-black rounded-full w-5 h-5 flex items-center justify-center"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
        {/* <Grafana vehicleNumber={vehicleNumbers} /> */}
        <GrafanaModal url={finalUrl} />
      </Modal>
    </>
  );
};

const styles = {
  overlay: {
    // position: 'fixed',
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  textarea: {
    width: "100%",
    height: "150px",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    padding: "8px",
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
  },
  button: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    backgroundColor: "#0070f3",
    color: "#fff",
  },
};
