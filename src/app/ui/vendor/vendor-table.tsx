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

import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { Button } from "../button";
import { Vendor } from "@/app/lib/types";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation'
import { createVendor, deleteVendor, updateVendor } from "@/app/lib/org-utils";

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

//Your API response shape will probably be different. Knowing a total row count is important though.
type VendorApiResponse = {
  data: Array<Vendor>;
  meta: {
    totalRowCount: number;
  };
};
const fetchSize = 25;

const Vendors = () => {
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
  const userId = session?.user?.userId || "";
  const role = session?.user?.role;
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const columns = useMemo<MRT_ColumnDef<Vendor>[]>(
    () => [
      {
        accessorKey: 'organizationName',
        header: 'Vendor Name',
        muiEditTextFieldProps: ({ row }) => ({
            disabled: row.original.orgId ? true : false,
            required: true,
            error: !!validationErrors?.organizationName,
            helperText: validationErrors?.organizationName,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                organizationName: undefined,
              }),
          }),
      },
      {
        accessorKey: 'orgId',
        header: 'VendorId',
        muiEditTextFieldProps: ({ row }) => ({
            disabled: row.original.orgId ? true : false,
            required: true,
            error: !!validationErrors?.orgId,
            helperText: validationErrors?.orgId,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                orgId: undefined,
              }),
          }),
      },
      {
        accessorKey: 'primaryContactName',
        header: 'Contact Name',
        muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.primaryContactName,
            helperText: validationErrors?.primaryContactName,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                primaryContactName: undefined,
              }),
          },
      },
      {
        accessorKey: 'primaryPhoneNumber',
        header: 'Phone Number',
        muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.primaryPhoneNumber,
            helperText: validationErrors?.primaryPhoneNumber,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                primaryPhoneNumber: undefined,
              }),
          },
      },
      {
        accessorKey: 'primaryEmail',
        header: 'Email',
        muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.primaryEmail,
            helperText: validationErrors?.primaryEmail,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                primaryEmail: undefined,
              }),
          },
      },
      {
        accessorKey: 'address1',
        header: 'Address1',
        muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.address1,
            helperText: validationErrors?.address1,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                address1: undefined,
              }),
          },
      },
      {
        accessorKey: 'address2',
        header: 'Address2',
      },
      {
        accessorKey: 'city',
        header: 'City',
        muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.city,
            helperText: validationErrors?.city,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                city: undefined,
              }),
          },
      },
      {
        accessorKey: 'state',
        header: 'State',
        muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.state,
            helperText: validationErrors?.state,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                state: undefined,
              }),
          },
      },
      {
        accessorKey: 'country',
        header: 'Country',
        muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.country,
            helperText: validationErrors?.country,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                country: undefined,
              }),
          },
      },
      {
        accessorKey: 'zip',
        header: 'Zip',
        muiEditTextFieldProps: {
            required: true,
            error: !!validationErrors?.zip,
            helperText: validationErrors?.zip,
            onFocus: () =>
              setValidationErrors({
                ...validationErrors,
                zip: undefined,
              }),
          },
      },
    ],
    [geofenceGroupNames, validationErrors]
  );

  const { data, fetchNextPage, isError, isFetching, isLoading, refetch } =
    useInfiniteQuery<VendorApiResponse>({
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
        const url = new URL("/node/api/vendor/search", nodeServerUrl);
        url.searchParams.set("start", `${(pageParam as number) * fetchSize}`);
        url.searchParams.set("size", `${fetchSize}`);
        url.searchParams.set("filters", JSON.stringify(columnFilters ?? []));
        url.searchParams.set("globalFilter", globalFilter ?? "");
        url.searchParams.set("sorting", JSON.stringify(sorting ?? []));
        url.searchParams.set("orgId", orgId);

        const response = await axios.get(url.toString(), 
        {
          headers: {
            Authorization: `Bearer ${session?.token.idToken}`,
          },
          // withCredentials: true,
        });
        // console.log(`data received ${JSON.stringify(response.data)}`);

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

  //called on scroll and possibly on mount to fetch more data as the page scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        //once the page has scrolled within 400px of the bottom of the table, fetch more data if we can
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
  const { mutateAsync: createVendor, isPending: isCreatingVendor } =
    useCreateVendor();
  //call READ hook
  // const {
  //   data: fetchedVehicles = [],
  //   isError: isLoadingVehiclesError,
  //   isFetching: isFetchingVehicles,
  //   isLoading: isLoadingVehicles,
  // } = useGetVehicles();
  //call UPDATE hook
  const { mutateAsync: updateVendor, isPending: isUpdatingVendor } =
    useUpdateVendor();
  //call DELETE hook
  const { mutateAsync: deleteVendor, isPending: isDeletingVendor } =
    useDeleteVendor();

  //CREATE action
  const handleCreateVendor: MRT_TableOptions<Vendor>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateVendor(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await createVendor(values);
      // console.log(`row created..`);
      refetch();
      table.setCreatingRow(null); //exit creating mode
    };

  //UPDATE action
  const handleSaveVendor: MRT_TableOptions<Vendor>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateVendor(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await updateVendor(values);
      table.setEditingRow(null); //exit editing mode
    };

  //DELETE action
  const openDeleteConfirmModal = async (row: MRT_Row<Vendor>) => {
    if (window.confirm(`Are you sure you want to delete Vendor ${row.original.orgId} ?`)) {
      await deleteVendor(row.original.orgId);
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
    onCreatingRowSave: handleCreateVendor,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveVendor,
    createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: role !== 'view',
    getRowId: (row) => row.orgId,

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
        <DialogTitle variant="h5">Create New Vendor</DialogTitle>
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
        <DialogTitle variant="h5">Edit Vendor</DialogTitle>
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
        key={`delete-${row.original.orgId}`}
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
        Create New Vendor
      </Button> }
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
      isSaving: isCreatingVendor || isUpdatingVendor || isDeletingVendor,
      rowSelection
    },
    rowVirtualizerInstanceRef, //get access to the virtualizer instance
    rowVirtualizerOptions: { overscan: 4 },
  });

  return <MaterialReactTable table={table} />;
};

//CREATE hook (post new vehicle to api)
function useCreateVendor() {
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId? session?.user?.secondaryOrgId : session?.user?.primaryOrgId as string;
  const userId = session?.user?.userId || "";

  return useMutation({
    mutationFn: async (vendor: Vendor) => {
      const status = await createVendor(session?.token.idToken, orgId, userId, vendor);
      return Promise.resolve(status);
    },
    //client side optimistic update
    onMutate: (newVendorInfo: Vendor) => {},
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
function useUpdateVendor() {
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId? session?.user?.secondaryOrgId : session?.user?.primaryOrgId as string;

  return useMutation({
    mutationFn: async (vendor: Vendor) => {
      const status = await updateVendor(session?.token.idToken, orgId, vendor);
      return Promise.resolve(status);
    },
    //client side optimistic update
    onMutate: (newVendorInfo: Vendor) => {
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
function useDeleteVendor() {
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId? session?.user?.secondaryOrgId : session?.user?.primaryOrgId as string;
  const userId = session?.user?.id as string;

  return useMutation({
    mutationFn: async (vendorId: string) => {
      //send api update request here
      const status = await deleteVendor(session?.token.idToken, userId, orgId, vendorId);
      return Promise.resolve(status);
    },
    //client side optimistic update
    onMutate: (vendorId: string) => {
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

const VendorsWithReactQueryProvider = () => (
  //App.tsx or AppProviders file. Don't just wrap this component with QueryClientProvider! Wrap your whole App!
  <QueryClientProvider client={queryClient}>
    <Vendors />
  </QueryClientProvider>
);

export default VendorsWithReactQueryProvider;

const validateRequired = (value: string) => !!value.length;
const validateRequiredNumber = (value: any) => {
  const numValue = Number(value);
  return !isNaN(numValue) && numValue.toString().length === 10;
};
const validateSerialNumber = (value: any) => {
  const numValue = Number(value);
  return !isNaN(numValue) && numValue.toString().length > 0;
};

function validateVendor(vendor: Vendor) {
  return {
    orgId: !validateRequired(vendor.orgId)
      ? "VendorId is Required"
      : "",
    organizationName: !validateRequired(vendor.organizationName)
      ? "Organization Name is Required"
      : "",
      primaryContactName: !validateRequired(vendor.primaryContactName)
      ? "Contact Name is Required"
      : "",
      primaryPhoneNumber: !validateRequired(vendor.primaryPhoneNumber)
      ? "Phone Number is Required"
      : "",
      primaryEmail: !validateRequired(vendor.primaryEmail)
      ? "Email is Required"
      : "",
      address1: !validateRequired(vendor.address1)
      ? "Address1 is Required"
      : "",
      city: !validateRequired(vendor.city)
      ? "City is Required"
      : "",
      state: !validateRequired(vendor.state)
      ? "State is Required"
      : "",
      country: !validateRequired(vendor.country)
      ? "Country is Required"
      : "",
      zip: !validateRequired(vendor.zip)
      ? "Zip is Required"
      : "",
  };
}
