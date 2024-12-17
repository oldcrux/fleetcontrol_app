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
  type MRT_RowSelectionState,
  MRT_EditActionButtons,
  MRT_TableOptions,
  MRT_Row,
  DropdownOption,
  MRT_ActionMenuItem,
  MRT_Cell,
} from "material-react-table";
import {
  Box,
  Checkbox,
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
  useQuery,
} from "@tanstack/react-query"; //Note: this is TanStack React Query V5

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { Button } from "../button";
import { fetchGeofenceGroups } from "@/app/lib/geofence-utils";
import {
  bulkCreateVehicle,
  createVehicle,
  deleteVehicle,
  updateVehicle,
} from "@/app/lib/vehicle-utils";
import { Vehicle } from "@/app/lib/types";
import { useSession } from "next-auth/react";
import { BulkCreateVehicle } from "./bulk-create-vehicle";
import { Grafana } from "../dashboard/grafana";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
// import { redirect } from "next/navigation";
import { useRouter } from 'next/navigation'
import { fetchVendorNames } from "@/app/lib/org-utils";

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

//Your API response shape will probably be different. Knowing a total row count is important though.
type VehicleApiResponse = {
  data: Array<Vehicle>;
  meta: {
    totalRowCount: number;
  };
};
const fetchSize = 25;

const Vehicles = () => {
  const router = useRouter();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null);

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState<string>();
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [geofenceGroupNames, setGeofenceGroupNames] = useState<string[]>([
    "None",
  ]);
  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId? session?.user?.secondaryOrgId : session?.user?.primaryOrgId as string;
  const vendorId = session?.user?.secondaryOrgId ? session?.user?.primaryOrgId as string: '' as string;
  const userId = session?.user?.userId || "";
  const role = session?.user?.role;
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGrafanaModalOpen, setIsGrafanaModalOpen] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [vendorNames, setVendorNames] = useState<string[]>(["None"]);

  const handleBulkCreateVehicle = (data: any) => {
    // console.log('Saved Data:', data);
    setIsModalOpen(false);

    const updatedData = data.map((item: any) => ({
      ...item,
      createdBy: userId,
      orgId: orgId
    }));
    bulkCreateVehicle(updatedData);
  };

  useEffect(() => {
    const vendorNames = async () => {
      const vendorNames = await fetchVendorNames(orgId);
      const options = vendorNames.map((vendor: { organizationName: any }) => vendor.organizationName);
      // console.log(`geofenceGrps:`, geofenceGrps);
      setVendorNames([orgId, ...options]);
      // console.log(`geofence Groups ${JSON.stringify(geofenceGroupNames)}`, geofenceGroupNames);
    };
    vendorNames();
  }, []);

  useEffect(() => {
    const geofenceGroups = async () => {
      const allGeofenceGroups = await fetchGeofenceGroups(orgId);
      // console.log(`useEffect called ${JSON.stringify(allGeofenceGroups)}`, allGeofenceGroups);
      const options = allGeofenceGroups.map(
        (location: { geofenceLocationGroupName: any }) =>
          location.geofenceLocationGroupName
      );

      // console.log(`geofenceGrps:`, geofenceGrps);
      setGeofenceGroupNames(["None", ...options]);
      // console.log(`geofence Groups ${JSON.stringify(geofenceGroupNames)}`, geofenceGroupNames);
    };
    geofenceGroups();
  }, []);

  const getInsights = (event: React.MouseEvent) => {
    // console.info( rowSelection );
    const selectedVehicles = Object.keys(rowSelection).filter((key) => rowSelection[key]);
    // console.info( selectedVehicles );
    setSelectedVehicles(selectedVehicles);
    if(selectedVehicles){
      setIsGrafanaModalOpen(true);
    }
  };
  
  const seeOnDashboard = (event: React.MouseEvent) => {
    // console.info( rowSelection );
    const selectedVehicles = Object.keys(rowSelection).filter((key) => rowSelection[key]);
    // console.info( selectedVehicles );
    // setSelectedVehicles(selectedVehicles);
    if(selectedVehicles){
      const vehicles = selectedVehicles.join(',');
      router.push(`/dashboard?query=${vehicles}`);
    }
  };

  const columns = useMemo<MRT_ColumnDef<Vehicle>[]>(
    () => [
      {
        accessorKey: "vehicleNumber",
        header: "Vehicle Number",
        muiEditTextFieldProps: ({ row }) => ({
          disabled: row.original.vehicleNumber ? true : false,
          required: true,
          error: !!validationErrors?.vehicleNumber,
          helperText: validationErrors?.vehicleNumber,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              vehicleNumber: undefined,
            }),
        }),
      },
      {
        accessorKey: "status",
        header: "Status",
        // Cell: ({ row }) =>
        //   row._valuesCache.isActive === "1" ? (
        //     <CheckIcon sx={{ color: "#22c55e" }} />
        //   ) : (
        //     <CloseIcon sx={{ color: "#ef4444" }} />
        //   ),
        muiEditTextFieldProps: {
          required: true,
          // value: "Active",
          helperText: validationErrors?.isActive,
        },
        editVariant: "select",
        editSelectOptions: ["Active", "InActive", "Standby"],
      },
      {
        accessorKey: "make",
        header: "Make",
      },
      {
        accessorKey: "model",
        header: "Model",
      },
      {
        accessorKey: "vendorId",
        header: "Vendor",
        editVariant: "select",
        editSelectOptions: vendorNames,
        muiEditTextFieldProps: ({ row, table }) => ({
          required: true,
          error: !!validationErrors?.vendorId,
          helperText: validationErrors?.vendorId,
          //remove any previous validation errors when vehicle focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              vendorId: undefined,
            }),
        }),
      },
      {
        accessorKey: "primaryPhoneNumber",
        header: "Primary Phone Number",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.primaryPhoneNumber,
          helperText: validationErrors?.primaryPhoneNumber,
          //remove any previous validation errors when vehicle focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              primaryPhoneNumber: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      },
      {
        accessorKey: "secondaryPhoneNumber",
        header: "Secondary Phone Number",
      },
      {
        accessorKey: "serialNumber",
        header: "Serial Number",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.serialNumber,
          helperText: validationErrors?.serialNumber,
          //remove any previous validation errors when vehicle focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              serialNumber: undefined,
            }),
        },
      },
      {
        accessorKey: "vehicleGroup",
        header: "Vehicle Group",
      },
      {
        accessorKey: "geofenceLocationGroupName",
        header: "Geofence Group",
        editVariant: "select",
        editSelectOptions: geofenceGroupNames,
        muiEditTextFieldProps: {
          select: true,
          error: !!validationErrors?.geofenceLocationGroupName,
          helperText: validationErrors?.geofenceLocationGroupName,
        },
      },
    ],
    [vendorNames, geofenceGroupNames, validationErrors]
  );

  const { data, fetchNextPage, isError, isFetching, isLoading, refetch } =
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
        // console.log(`page param`, pageParam);
        const url = new URL("/node/api/vehicle/search", nodeServerUrl);
        url.searchParams.set("start", `${(pageParam as number) * fetchSize}`);
        url.searchParams.set("size", `${fetchSize}`);
        url.searchParams.set("filters", JSON.stringify(columnFilters ?? []));
        url.searchParams.set("globalFilter", globalFilter ?? "");
        url.searchParams.set("sorting", JSON.stringify(sorting ?? []));
        url.searchParams.set("orgId", orgId);
        url.searchParams.set("vendorId", vendorId);

        // console.log(`making db call: ${JSON.stringify(url)}`);
        const response = await axios.get(url.toString());
        // console.log(`data received ${JSON.stringify(response.data)}`);
        // const json = (await response.json()) as VehicleApiResponse;

        return response.data;
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

  //call CREATE hook
  const { mutateAsync: createVehicle, isPending: isCreatingVehicle } =
    useCreateVehicle();
  //call READ hook
  // const {
  //   data: fetchedVehicles = [],
  //   isError: isLoadingVehiclesError,
  //   isFetching: isFetchingVehicles,
  //   isLoading: isLoadingVehicles,
  // } = useGetVehicles();
  //call UPDATE hook
  const { mutateAsync: updateVehicle, isPending: isUpdatingVehicle } =
    useUpdateVehicle();
  //call DELETE hook
  const { mutateAsync: deleteVehicle, isPending: isDeletingVehicle } =
    useDeleteVehicle();

  //CREATE action
  const handleCreateVehicle: MRT_TableOptions<Vehicle>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateVehicle(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await createVehicle(values);
      // console.log(`row created..`);
      refetch();
      table.setCreatingRow(null); //exit creating mode
    };

  //UPDATE action
  const handleSaveVehicle: MRT_TableOptions<Vehicle>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateVehicle(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await updateVehicle(values);
      table.setEditingRow(null); //exit editing mode
    };

  //DELETE action
  const openDeleteConfirmModal = async (row: MRT_Row<Vehicle>) => {
    if (window.confirm(`Are you sure you want to delete vehicle ${row.original.vehicleNumber} ?`)) {
      await deleteVehicle(row.original.vehicleNumber);
    }
    refetch();
  };

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
    enableDensityToggle: false,

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateVehicle,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveVehicle,
    createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: role !== 'view',
    getRowId: (row) => row.vehicleNumber,

    enableRowSelection:true,

    
    // muiTableBodyRowProps: ({ row }) => ({
    //   onClick: () =>
    //     setRowSelection((prev) => {
    //       const isSelected = prev[row.id];
    //       if (isSelected) {
    //         // Remove the key when unselected
    //         const { [row.id]: _, ...rest } = prev;
    //         return rest;
    //       } else {
    //         // Add the key when selected
    //         return {
    //           ...prev,
    //           [row.id]: true,
    //         };
    //       }
    //     }),
    //   selected: !!rowSelection[row.id], // Ensure it's a boolean
    //   sx: {
    //     cursor: 'pointer',
    //   },
    // }),
    onRowSelectionChange: setRowSelection, //connect internal row selection state to your own

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
    renderRowActionMenuItems: ({ row, table }) => [
      // <MRT_ActionMenuItem //or just use a normal MUI MenuItem component
      //     icon={<EditIcon />}
      //     key="edit"
      //     label="Edit"
      //     onClick={() =>
      //     {table.setEditingRow(row)}
      //     }
      //     table={table}
      //   />,
      <MRT_ActionMenuItem
        icon={<DeleteIcon color="error" />}
        key={`delete-${row.original.vehicleNumber}`}
        label="Delete"
        onClick={() => {
          openDeleteConfirmModal(row);
        }}
        table={table}
      />,
    ],

    // enableRowActions:true,
    // renderRowActions: ({ row, table }) => (
    //   <Box sx={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
    //     <Tooltip title="Edit">
    //       <IconButton onClick={() => {
    //         // console.log(`setting creating to false`);
    //         // setCreating(false);
    //         table.setEditingRow(row)}}>
    //         <EditIcon />
    //       </IconButton>
    //     </Tooltip>
    //     <Tooltip title="Delete">
    //       <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
    //         <DeleteIcon />
    //       </IconButton>
    //     </Tooltip>
    //   </Box>
    // ),

    renderTopToolbarCustomActions: ({ table }) => (
      <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {role !=='view' && <Button disabled={Object.keys(rowSelection).length !== 0}
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
      </Button> }
      {role !=='view' && <Button disabled={Object.keys(rowSelection).length !== 0} onClick={() => setIsModalOpen(true)}>
       Bulk Create Vehicles</Button> }

       <Button disabled={Object.keys(rowSelection).length === 0} onClick={seeOnDashboard}>
       See on Dashboard
       </Button>

       <Button disabled={Object.keys(rowSelection).length === 0} onClick={getInsights}>
       Get Insights {">"} 
       <OpenInNewIcon sx={{paddingLeft:1, fontSize:25, color: '#d5d7db'}}/>
       </Button>

       <BulkCreateVehicle show={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleBulkCreateVehicle} />
       <Grafana openInNewTab={true} show={isGrafanaModalOpen} onClose={() => setIsGrafanaModalOpen(false)} vehicleNumbers={selectedVehicles} />
       </div>
      </>
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
      isSaving: isCreatingVehicle || isUpdatingVehicle || isDeletingVehicle,
      rowSelection
    },
    rowVirtualizerInstanceRef, //get access to the virtualizer instance
    rowVirtualizerOptions: { overscan: 4 },
  });

  return <MaterialReactTable table={table} />;
};

//CREATE hook (post new vehicle to api)
function useCreateVehicle() {
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId? session?.user?.secondaryOrgId : session?.user?.primaryOrgId as string;
  const userId = session?.user?.userId || "";

  return useMutation({
    mutationFn: async (vehicle: Vehicle) => {
      const status = await createVehicle(orgId, userId, vehicle);
      return Promise.resolve(status);
    },
    //client side optimistic update
    onMutate: (newVehicleInfo: Vehicle) => {},
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }), //refetch vehicles after mutation, disabled for demo
  });
}

//READ hook (get vehicles from api)
// function useGetVehicles() {
//   return useQuery<Vehicle[]>({
//     queryKey: ['vehicles'],
//     queryFn: async () => {
//       //send api request here
//       const orgId = "bmc"; //TODO remove hardcoding
//         const url = new URL("/node/api/vehicle/search", nodeServerUrl);
//         url.searchParams.set("start", `0`);
//         url.searchParams.set("size", `${fetchSize}`);
//         url.searchParams.set("orgId", orgId);

//         const response = await axios.get(url);
//       return Promise.resolve(response);
//     },
//     refetchOnWindowFocus: false,
//   });
// }

//UPDATE hook (put vehicle in api)
function useUpdateVehicle() {
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId? session?.user?.secondaryOrgId : session?.user?.primaryOrgId as string;

  return useMutation({
    mutationFn: async (vehicle: Vehicle) => {
      const status = await updateVehicle(orgId, vehicle);
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

//DELETE hook (delete vehicle in api)
function useDeleteVehicle() {
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId? session?.user?.secondaryOrgId : session?.user?.primaryOrgId as string;
  const userId = session?.user?.id as string;

  return useMutation({
    mutationFn: async (vehicleNumber: string) => {
      //send api update request here
      const status = await deleteVehicle(userId, orgId, vehicleNumber);
      return Promise.resolve(status);
    },
    //client side optimistic update
    onMutate: (vehicleNumber: string) => {
      // queryClient.setQueryData(["vehicles"], (prevVehicles: any) =>
      //   prevVehicles?.filter(
      //     (vehicle: Vehicle) => vehicle.vehicleNumber !== vehicleNumber
      //   )
      // );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }), //refetch vehicles after mutation, disabled for demo
  });
  
}

const queryClient = new QueryClient();

const VehiclesWithReactQueryProvider = () => (
  //App.tsx or AppProviders file. Don't just wrap this component with QueryClientProvider! Wrap your whole App!
  <QueryClientProvider client={queryClient}>
    <Vehicles />
  </QueryClientProvider>
);

export default VehiclesWithReactQueryProvider;

const validateRequired = (value: string) => !!value.length;
const validateRequiredNumber = (value: any) => {
  const numValue = Number(value);
  return !isNaN(numValue) && numValue.toString().length === 10;
};
const validateSerialNumber = (value: any) => {
  const numValue = Number(value);
  return !isNaN(numValue) && numValue.toString().length > 0;
};

function validateVehicle(vehicle: Vehicle) {
  return {
    vehicleNumber: !validateRequired(vehicle.vehicleNumber)
      ? "Vehicle Number is Required"
      : "",
    primaryPhoneNumber: !validateRequiredNumber(vehicle.primaryPhoneNumber)
      ? "Primary Phone Number is Required"
      : "",
    serialNumber: !validateSerialNumber(vehicle.serialNumber)
      ? "Serial Number is Required"
      : "",
  };
}
