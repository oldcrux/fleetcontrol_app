"use client";
import {
  type UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_SortingState,
  type MRT_RowVirtualizer,
  MRT_EditActionButtons,
  MRT_TableOptions,
  MRT_Row,
  DropdownOption,
  MRT_ActionMenuItem,
} from "material-react-table";
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useQueryClient,
  useMutation,
  useQuery
} from "@tanstack/react-query"; //Note: this is TanStack React Query V5

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import axios from "axios";
import { Button } from "../button";
import { createVehicle, deleteVehicle, updateVehicle } from "@/app/lib/vehicle-utils";
import { Vehicle } from "@/app/lib/types";
import { useSession } from 'next-auth/react';

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

//Your API response shape will probably be different. Knowing a total row count is important though.
type VehicleApiResponse = {
  data: Array<Vehicle>;
  meta: {
    totalRowCount: number;
  };
};
const fetchSize = 25;

interface VehicleModal2Props {
    label?: string; // Optional label prop
  }
  
  const VehicleModal2: React.FC<VehicleModal2Props> = ({ label }) => {
// const VehicleModal2 = ({ label }: VehicleModal2Props) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState<string>();
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  // const [creating, setCreating] = useState(true);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
//   const [geofenceGroupNames, setGeofenceGroupNames] = useState([]);

  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId ? session?.user?.secondaryOrgId as string : session?.user?.primaryOrgId as string;

  let option1 = [
    '-',
  ]

//   useEffect(() => {
    
//     // console.log(`option1 before ${JSON.stringify(option1)}`);
//     const fetchGeofenceGroups = async () => {
//       const allGeofenceGroups = await geofenceGroups(orgId);
//       // console.log(`useEffect called ${JSON.stringify(allGeofenceGroups)}`);
//       const options = allGeofenceGroups.map((location: { geofenceLocationGroupName: any; })=> location.geofenceLocationGroupName);

//       // console.log(`options ${JSON.stringify(options)}`);
//       // option1=options;
//       // console.log(`option1 after ${JSON.stringify(option1)}`);
//       setGeofenceGroupNames(options);
//       // console.log(`geofence Groups ${JSON.stringify(geofenceGroupNames)}`);
//     };
//     fetchGeofenceGroups();
//   }, []);

  const columns = useMemo<MRT_ColumnDef<Vehicle>[]>(
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
    ],
    [validationErrors]
  );

  const { data, fetchNextPage, isError, isFetching, isLoading,refetch } =
    useInfiniteQuery<VehicleApiResponse>({
      queryKey: [
        "table-data",
        // TODO on globalFilter, this sends infinite requests to server. Need to investigate
        // TODO use useDebouncedCallback.  Refer search.tsx
        columnFilters, //refetch when columnFilters changes
        globalFilter, //refetch when globalFilter changes
        sorting, //refetch when sorting changes
      ],
      queryFn: async ({ pageParam }) => {
        console.log(`searching vehicles ${label}`);
        if (typeof window !== "undefined") {
            if (label === "Idle") {
                console.log(`searching idle vehicles`);
                const url = new URL("/node/api/vehicle/idle/search", nodeServerUrl);
                url.searchParams.set("start", `${(pageParam as number) * fetchSize}`);
                url.searchParams.set("size", `${fetchSize}`);
                url.searchParams.set("filters", JSON.stringify(columnFilters ?? []));
                url.searchParams.set("globalFilter", globalFilter ?? "");
                url.searchParams.set("sorting", JSON.stringify(sorting ?? []));
                url.searchParams.set("orgId", orgId);
        
                // const response = await fetch(url.href);
                const response = await axios.get(url.toString());
                // console.log(`data received ${JSON.stringify(response.data)}`);
                // const json = (await response.json()) as VehicleApiResponse;
                return response.data;
            }
            else if (label === "Running") {
                console.log(`searching running vehicles`);
                const url = new URL("/node/api/vehicle/running/search", nodeServerUrl);
                url.searchParams.set("start", `${(pageParam as number) * fetchSize}`);
                url.searchParams.set("size", `${fetchSize}`);
                url.searchParams.set("filters", JSON.stringify(columnFilters ?? []));
                url.searchParams.set("globalFilter", globalFilter ?? "");
                url.searchParams.set("sorting", JSON.stringify(sorting ?? []));
                url.searchParams.set("orgId", orgId);
        
                // const response = await fetch(url.href);
                const response = await axios.get(url.toString());
                // console.log(`data received ${JSON.stringify(response.data)}`);
                // const json = (await response.json()) as VehicleApiResponse;
                return response.data;
            }
        }
       
      },
      initialPageParam: 0,
      getNextPageParam: (_lastGroup, groups) => groups.length,
      refetchOnWindowFocus: false,
    });

  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = flatData.length;

  //called on scroll and possibly on mount to fetch more data as the vehicle scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        //once the vehicle has scrolled within 400px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 400 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  );

  //scroll to top of table when sorting or filters change
  useEffect(() => {
    //scroll to the top of the table when the sorting changes
    try {
      rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
    } catch (error) {
      console.error(error);
    }
  }, [sorting, columnFilters, globalFilter]);

  //a check on mount to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const table = useMaterialReactTable({
    columns,
    data: flatData,
    enableColumnActions: false,
    enablePagination: false,
    enableRowNumbers: false,
    enableRowVirtualization: true,
    enableColumnResizing: true,
    // manualFiltering: true,
    manualSorting: false,
    enableSorting: false,
    // enableGlobalFilter: false,
    // enableFilters: false,
    enableDensityToggle:false,

    onCreatingRowCancel: () => setValidationErrors({}),

    onEditingRowCancel: () => setValidationErrors({}),

    createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row.vehicleNumber,

    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h5">Create New Vehicle</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h5">Edit Vehicle</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),


    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        onClick={() => {
          // console.log(`setting creating flag to true`);
          // setCreating(true);
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the `createRow` helper function
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
        }}
      >
        Create New Vehicle
      </Button>
      
    ),
    // initialState: {
    //   density: 'compact',
    // },
    muiTableContainerProps: {
      ref: tableContainerRef, //get access to the table container element
      sx: { maxHeight: "600px" }, //give the table a max height
      onScroll: (event: UIEvent<HTMLDivElement>) =>
        fetchMoreOnBottomReached(event.target as HTMLDivElement), //add an event listener to the table container element
    },
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    renderBottomToolbarCustomActions: () => (
      <Typography>
        Fetched {totalFetched} of {totalDBRowCount} total rows.
      </Typography>
    ),
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isFetching,
      sorting,
    },
    rowVirtualizerInstanceRef, //get access to the virtualizer instance
    rowVirtualizerOptions: { overscan: 4 },
  });

  return <MaterialReactTable table={table} />;
};


//UPDATE hook (put vehicle in api)
function useUpdateVehicle() {
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId ? session?.user?.secondaryOrgId : session?.user?.primaryOrgId;

  return useMutation({
    mutationFn: async (vehicle: Vehicle) => {
      const status = await updateVehicle(orgId as string, vehicle);
      return Promise.resolve(status);
    },
    //client side optimistic update
    onMutate: (newVehicleInfo: Vehicle) => {
      // queryClient.setQueryData(["vehicles"], (prevVehicles: any) =>
      //   prevVehicles?.map((prevVehicle: Vehicle) =>
      //     prevVehicle.vehicleNumber === newVehicleInfo.vehicleNumber
      //       ? newVehicleInfo
      //       : prevVehicle
      //   )
      // );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }), //refetch vehicles after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const VehiclesWithReactQueryProvider = () => (
    <QueryClientProvider client={queryClient}>
      <VehicleModal2 />
    </QueryClientProvider>
  );

export default VehiclesWithReactQueryProvider;