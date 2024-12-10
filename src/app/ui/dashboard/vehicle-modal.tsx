import { useEffect, useMemo, useRef, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_SortingState,
  type MRT_RowVirtualizer,
} from "material-react-table";
import { Vehicle } from "@/app/lib/types";
import { fetchAllIdleVehicles, fetchAllRunningVehicles, fetchAllSpeedingVehicles, fetchGhostVehicles, fetchVehiclesIgnitionOff } from "@/app/lib/vehicle-utils";
import { useSession } from "next-auth/react";

const VehicleModal = (label: any) => {
  
  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId ? session?.user?.secondaryOrgId : session?.user?.primaryOrgId;
  const vendorId = session?.user?.secondaryOrgId ? session?.user?.primaryOrgId : null;

  // console.log(`calling modal table with label: ${JSON.stringify(label.label)}`);
  const columns = useMemo<MRT_ColumnDef<Vehicle>[]>(
    //column definitions...
    () => [
      {
        accessorKey: "vehicleNumber",
        header: "Vehicle Number",
      },
      {
        accessorKey: "owner",
        header: "Owner",
      },
      {
        accessorKey: "primaryPhoneNumber",
        header: "Primary Phone Number",
      },
      {
        accessorKey: "secondaryPhoneNumber",
        header: "Secondary Phone Number",
      },
      {
        accessorKey: "vehicleGroup",
        header: "Vehicle Group",
      },
      {
        accessorKey: "geofenceLocationGroupName",
        header: "Geofence Group",
      },
      {
        accessorKey: "timestamp",
        header: "Last Seen",
        Cell: ({ row }) => {
          const timestamp = row.getValue('timestamp') as string;
          if (!timestamp || isNaN(new Date(timestamp as string).getTime())) {
            return <span>-</span>; // Return placeholder for null or invalid date
          }
          const localTime = new Date(timestamp).toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
          return <span>{localTime}</span>;
        },
      },
    ],
    []
    //end
  );

  //optionally access the underlying virtualizer instance
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);

  const [data, setData] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  useEffect(() => {
    const vehicles = async () => {
      console.log(`orgId fetched from session: ${orgId}`);
      if (typeof window !== "undefined") {
        if (label.label === "Ghost") {
          const offVehicles = await fetchGhostVehicles(orgId as string, vendorId as string);
          setData(offVehicles);
        } else if (label.label === "Off") {
          const offVehicles = await fetchVehiclesIgnitionOff(orgId as string, vendorId as string);
          setData(offVehicles);
        } else if (label.label === "Idle") {
          const idleVehicles = await fetchAllIdleVehicles(orgId as string, vendorId as string);
          setData(idleVehicles);
        } else if (label.label === "Running") {
          const runningVehicles = await fetchAllRunningVehicles(orgId as string, vendorId as string);
          setData(runningVehicles);
        } else if (label.label === "Speeding") {
          const speedingVehicles = await fetchAllSpeedingVehicles(orgId as string, vendorId as string);
          setData(speedingVehicles);
        }
        setIsLoading(false);
      }
    };
    vehicles();
  }, []);

  useEffect(() => {
    //scroll to the top of the table when the sorting changes
    try {
      rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
    } catch (error) {
      console.error(error);
    }
  }, [sorting]);

  const table = useMaterialReactTable({
    columns,
    data, //10,000 rows
    defaultDisplayColumn: { enableResizing: true },
    enableBottomToolbar: false,
    enableColumnResizing: true,
    enableColumnVirtualization: true,
    enableGlobalFilterModes: true,
    enablePagination: false,
    enableColumnPinning: true,
    enableRowNumbers: true,
    enableRowVirtualization: true,
    muiTableContainerProps: { sx: { maxHeight: "600px" } },
    onSortingChange: setSorting,
    state: { isLoading, sorting },
    rowVirtualizerInstanceRef, //optional
    rowVirtualizerOptions: { overscan: 5 }, //optionally customize the row virtualizer
    columnVirtualizerOptions: { overscan: 2 }, //optionally customize the column virtualizer
    enableColumnActions: false,
    enableSorting: false,
    enableGlobalFilter: false,
    enableFilters: true,
    enableDensityToggle:false
  });

  return <MaterialReactTable table={table} />;
};

export default VehicleModal;
