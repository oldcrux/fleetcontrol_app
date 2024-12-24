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
import { Visibility, VisibilityOff } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import PasswordOutlinedIcon from "@mui/icons-material/PasswordOutlined";
import axios from "axios";
import { Button } from "../button";
import { User } from "@/app/lib/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createUser, deleteUser, updateUser } from "@/app/lib/user-utils";
import { fetchVendorNames } from "@/app/lib/org-utils";
import { ChangePassword } from "./change_password";
import bcrypt from "bcryptjs";

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

//Your API response shape will probably be different. Knowing a total row count is important though.
type UserApiResponse = {
  data: Array<User>;
  meta: {
    totalRowCount: number;
  };
};
const fetchSize = 25;

const Users = () => {
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
  const [vendorNames, setVendorNames] = useState<string[]>(["None"]);
  const [selectedVendor, setSelectedVendor] = useState<string>();
  const [selectedAuthType, setSelectedAuthType] = useState<string>();

  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId
    ? session?.user?.secondaryOrgId
    : (session?.user?.primaryOrgId as string);
  const userId = session?.user?.userId || "";
  const role = session?.user?.role;
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [password, setPassword] = useState<string>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const vendorNames = async () => {
      const vendorNames = await fetchVendorNames(session?.token.idToken, orgId);
      const options = vendorNames.map(
        (vendor: { organizationName: any }) => vendor.organizationName
      );
      // console.log(`geofenceGrps:`, geofenceGrps);
      setVendorNames([orgId, ...options]);
      // console.log(`geofence Groups ${JSON.stringify(geofenceGroupNames)}`, geofenceGroupNames);
    };
    vendorNames();
  }, []);

  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "userId",
        header: "UserId",
        muiEditTextFieldProps: ({ row }) => ({
          disabled: row.original.userId ? true : false,
          required: true,
          error: !!validationErrors?.userId,
          helperText: validationErrors?.userId,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              userId: undefined,
            }),
        }),
      },
      {
        accessorKey: "isActive",
        header: "Active?",
        editVariant: "select",
        editSelectOptions: ["true", "false"],
        accessorFn: (originalRow) => (originalRow.isActive ? "true" : "false"),
        Cell: ({ cell }) => (
          <span
            style={{
              color: cell.getValue() === "true" ? "green" : "red",
              fontSize: "18px",
            }}
          >
            {cell.getValue() === "true" ? "✔" : "❌"}
          </span>
        ),
      },
      {
        accessorKey: "firstName",
        header: "First Name",
        muiEditTextFieldProps: ({ row }) => ({
          required: true,
          error: !!validationErrors?.firstName,
          helperText: validationErrors?.firstName,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              firstName: undefined,
            }),
        }),
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.lastName,
          helperText: validationErrors?.lastName,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              lastName: undefined,
            }),
        },
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone Number",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.phoneNumber,
          helperText: validationErrors?.phoneNumber,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              phoneNumber: undefined,
            }),
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.email,
          helperText: validationErrors?.email,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              email: undefined,
            }),
        },
      },
      {
        accessorKey: "primaryOrgId",
        header: "Primary Org",
        editVariant: "select",
        editSelectOptions: vendorNames,
        muiEditTextFieldProps: ({ row, table }) => ({
          required: true,
          onChange: (event) => {
            const selectedVendor = event.target.value;
            setSelectedVendor(selectedVendor);
          },
        }),
      },
      {
        accessorKey: "role",
        header: "Role",
        editVariant: "select",
        editSelectOptions: ["admin", "view"],
        muiEditTextFieldProps: ({ row }) => ({
          required: true,
          value:
            selectedVendor && selectedVendor !== orgId
              ? "view"
              : row.original.role, // Default to "view" or retain current value
          disabled: selectedVendor && selectedVendor !== orgId ? true : false, // Disable if condition is met, otherwise allow edits
          error: !!validationErrors?.role,
          helperText: validationErrors?.role,
          onChange: (event) => {
            const value = event.target.value;
            row.original.role = value; // Update role value dynamically
          },
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              role: undefined,
            }),
        }),
      },
      {
        accessorKey: "authType",
        header: "Authentication Type",
        editVariant: "select",
        editSelectOptions: ["db", "others"],
        muiEditTextFieldProps: ({ row }) => ({
          required: true,
          error: !!validationErrors?.role,
          helperText: validationErrors?.role,
          onChange: (event) => {
            const selectedAuthType = event.target.value;
            setSelectedAuthType(selectedAuthType);
          },
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              role: undefined,
            }),
        }),
      },
      {
        accessorKey: "password",
        header: "Password",
        Cell: ({ row }) => "********",
        muiEditTextFieldProps: ({ row }) => ({
          disabled: row.original.authType !== "db" && selectedAuthType !== "db",
          required: selectedAuthType === "db",
          type: passwordVisible ? "text" : "password",
          error: !!validationErrors?.password,
          helperText: validationErrors?.password,
          value: password,
          onChange: (event) => {
            setPassword(event.target.value);
          },
          onFocus: () =>
            setValidationErrors((prev) => ({ ...prev, password: undefined })),
          InputProps: {
            endAdornment: (
              <IconButton
                disabled={
                  row.original.authType !== "db" && selectedAuthType !== "db"
                }
                onClick={() => setPasswordVisible((prev) => !prev)}
                edge="end"
              >
                {passwordVisible ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            ),
          },
        }),
      },
      {
        accessorKey: "address1",
        header: "Address1",
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
        accessorKey: "address2",
        header: "Address2",
      },
      {
        accessorKey: "city",
        header: "City",
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
        accessorKey: "state",
        header: "State",
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
        accessorKey: "country",
        header: "Country",
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
        accessorKey: "zip",
        header: "Zip",
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
    [
      passwordVisible,
      vendorNames,
      selectedVendor,
      selectedAuthType,
      password,
      validationErrors,
    ]
  );

  const { data, fetchNextPage, isError, isFetching, isLoading, refetch } =
    useInfiniteQuery<UserApiResponse>({
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
        const url = new URL("/node/api/user/fetch", nodeServerUrl);
        url.searchParams.set("start", `${(pageParam as number) * fetchSize}`);
        url.searchParams.set("size", `${fetchSize}`);
        url.searchParams.set("filters", JSON.stringify(columnFilters ?? []));
        url.searchParams.set("globalFilter", globalFilter ?? "");
        url.searchParams.set("sorting", JSON.stringify(sorting ?? []));
        url.searchParams.set("orgId", orgId);

        // console.log(`making db call: ${JSON.stringify(url)}`);
        const response = await axios.get(url.toString(), {
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
  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateUser();
  //call READ hook
  // const {
  //   data: fetchedVehicles = [],
  //   isError: isLoadingVehiclesError,
  //   isFetching: isFetchingVehicles,
  //   isLoading: isLoadingVehicles,
  // } = useGetVehicles();
  //call UPDATE hook
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  //call DELETE hook
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();

  //CREATE action
  const handleCreateUser: MRT_TableOptions<User>["onCreatingRowSave"] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createUser(values);
    // console.log(`row created..`);
    refetch();
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveUser: MRT_TableOptions<User>["onEditingRowSave"] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateUser(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = async (row: MRT_Row<User>) => {
    if (
      window.confirm(
        `Are you sure you want to delete User ${row.original.userId} ?`
      )
    ) {
      await deleteUser(row.original.userId);
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
    enableRowSelection: true,
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,
    createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: role !== "view",
    getRowId: (row) => row.userId,

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
        <DialogTitle variant="h5">Create New User</DialogTitle>
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
        <DialogTitle variant="h5">Edit User</DialogTitle>
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
        key={`delete-${row.original.userId}`}
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
        {role !== "view" && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button
              disabled={Object.keys(rowSelection).length !== 0}
              onClick={() => {
                // console.log(`setting creating flag to true`);
                // setCreating(true);
                table.setCreatingRow(true);
              }}
              icon={
                <PersonAddAltOutlinedIcon
                  sx={{ paddingLeft: 1, fontSize: 25, color: "#d5d7db" }}
                />
              }
            >
              Create New User
            </Button>
            <Button
              disabled={
                Object.keys(rowSelection).length === 0 ||
                Object.keys(rowSelection).length > 1
              }
              onClick={() => setIsModalOpen(true)}
              icon={
                <PasswordOutlinedIcon
                  sx={{ paddingLeft: 1, fontSize: 25, color: "#d5d7db" }}
                />
              }
            >
              Change Password
            </Button>
            <ChangePassword
              user={Object.keys(rowSelection)}
              show={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        )}
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
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      rowSelection,
    },
    rowVirtualizerInstanceRef, //get access to the virtualizer instance
    rowVirtualizerOptions: { overscan: 4 },
  });

  return <MaterialReactTable table={table} />;
};

//CREATE hook (post new vehicle to api)
function useCreateUser() {
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId
    ? session?.user?.secondaryOrgId
    : (session?.user?.primaryOrgId as string);
  const userId = session?.user?.userId || "";

  return useMutation({
    mutationFn: async (user: User) => {
      const password = await bcrypt.hash(user.password, 10);
      user.password = password;
      const status = await createUser(
        session?.token.idToken,
        orgId,
        userId,
        user
      );
      return Promise.resolve(status);
    },
    //client side optimistic update
    onMutate: (newUserInfo: User) => {},
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
function useUpdateUser() {
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId
    ? session?.user?.secondaryOrgId
    : (session?.user?.primaryOrgId as string);

  return useMutation({
    mutationFn: async (user: User) => {
      const status = await updateUser(session?.token.idToken, orgId, user);
      return Promise.resolve(status);
    },
    //client side optimistic update
    onMutate: (newUserInfo: User) => {
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
function useDeleteUser() {
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId
    ? session?.user?.secondaryOrgId
    : (session?.user?.primaryOrgId as string);
  const loggedInUserId = session?.user?.userId as string;

  return useMutation({
    mutationFn: async (userId: string) => {
      //send api update request here
      const status = await deleteUser(
        session?.token.idToken,
        userId,
        orgId,
        loggedInUserId
      );
      return Promise.resolve(status);
    },
    //client side optimistic update
    onMutate: (userId: string) => {
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

const UsersWithReactQueryProvider = () => (
  //App.tsx or AppProviders file. Don't just wrap this component with QueryClientProvider! Wrap your whole App!
  <QueryClientProvider client={queryClient}>
    <Users />
  </QueryClientProvider>
);

export default UsersWithReactQueryProvider;

const validateRequired = (value: string) => !!value.length;
const validateRequiredNumber = (value: any) => {
  const numValue = Number(value);
  return !isNaN(numValue) && numValue.toString().length === 10;
};
const passwordValidateRequired = (authType: string, value: string) => {
  return authType === "db" && value.length < 8;
};

function validateUser(user: User) {
  return {
    userId: !validateRequired(user.userId) ? "UserId is Required" : "",
    primaryOrgId: !validateRequired(user.primaryOrgId)
      ? "Primary organization is Required"
      : "",
    firstName: !validateRequired(user.firstName)
      ? "First Name is Required"
      : "",
    lastName: !validateRequired(user.lastName) ? "Last Name is Required" : "",
    phoneNumber: !validateRequired(user.phoneNumber)
      ? "Phone Number is Required"
      : "",
    password: passwordValidateRequired(user.authType, user.password)
      ? "Password must be at least 8 characters."
      : "",
    email: !validateRequired(user.email) ? "Email is Required" : "",
    address1: !validateRequired(user.address1) ? "Address1 is Required" : "",
    city: !validateRequired(user.city) ? "City is Required" : "",
    state: !validateRequired(user.state) ? "State is Required" : "",
    country: !validateRequired(user.country) ? "Country is Required" : "",
    zip: !validateRequired(user.zip) ? "Zip is Required" : "",
  };
}
