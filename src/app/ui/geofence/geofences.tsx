import { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  MRT_ActionMenuItem,
  MRT_EditActionButtons,
  MRT_Row,
  MRT_RowSelectionState,
  MRT_TableOptions,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table";
import { useSession } from "next-auth/react";
import {
  deleteGeofenceLocationById,
  updateGeofence,
} from "@/app/lib/geofence-utils";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Button } from "../button";
import { useRouter } from "next/navigation";
import axios from "axios";

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

interface LocationProps {
  onClose: () => void;
}

type GeofenceApiResponse = {
  data: Array<Geofence>;
  meta: {
    totalRowCount: number;
  };
};

type Geofence = {
  geofenceLocationGroupName: string;
  center: string;
  tag: string;
  geofenceType: string;
  radius: number;
  scheduleArrival: string;
  haltDuration: number;
  id: string;
};

const Geofences: React.FC<LocationProps> = ({ onClose }) => {
  const router = useRouter();
  const [data, setData] = useState<Geofence[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId
    ? session?.user?.secondaryOrgId
    : session?.user?.primaryOrgId;
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
  //table state
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      if (!data.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }

      let path = `/node/api/geofence/fetch`;
      const url = new URL(path, nodeServerUrl);
      url.searchParams.set(
        "start",
        `${pagination.pageIndex * pagination.pageSize}`
      );
      url.searchParams.set("size", `${pagination.pageSize}`);
      url.searchParams.set("filters", JSON.stringify(columnFilters ?? []));
      url.searchParams.set("globalFilter", globalFilter ?? "");
      url.searchParams.set("sorting", JSON.stringify(sorting ?? []));
      url.searchParams.set("orgId", orgId as string);

      try {
        // const response = await fetch(url.href);
        const response = await axios.get(`${url}`, {
          headers: {
            Authorization: `Bearer ${session?.token.idToken}`,
          },
          // withCredentials: true,
        });
        const json = (await response.data) as GeofenceApiResponse;
        setData(json.data);
        setRowCount(json.meta.totalRowCount);
      } catch (error) {
        setIsError(true);
        console.error(error);
        return;
      }
      setIsError(false);
      setIsLoading(false);
      setIsRefetching(false);
    };
    fetchData();
  }, [
    columnFilters,
    globalFilter,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    isRefetching
  ]);

  const columns = useMemo<MRT_ColumnDef<Geofence>[]>(
    () => [
      {
        accessorKey: "geofenceLocationGroupName",
        header: "Geofence Group",
        muiEditTextFieldProps: {
          error: !!validationErrors.geofenceLocationGroupName,
          helperText: validationErrors.geofenceLocationGroupName,
          required: true,
          type: "string",
          onChange: (event) => {
            const value = event.target.value;
            if (!value) {
              setValidationErrors((prev) => ({
                ...prev,
                geofenceLocationGroupName:
                  "Geofence Group is required",
              }));
            } else {
              delete validationErrors.geofenceLocationGroupName;
              setValidationErrors({ ...validationErrors });
            }
          },
        },
      },
      {
        accessorKey: "tag",
        header: "Tag",
        muiEditTextFieldProps: {
          error: !!validationErrors.tag,
          helperText: validationErrors.tag,
          required: true,
          type: "string",
          onChange: (event) => {
            const value = event.target.value;
            if (!value) {
              setValidationErrors((prev) => ({
                ...prev,
                tag: "Tag is required",
              }));
            } else {
              delete validationErrors.tag;
              setValidationErrors({ ...validationErrors });
            }
          },
        },
      },
      {
        accessorKey: "center",
        header: "Coordinates",
        muiEditTextFieldProps: {
          error: !!validationErrors.center,
          helperText: validationErrors.center,
          required: true,
          type: "string",
          onChange: (event) => {
            const value = event.target.value;
            if (!value) {
              setValidationErrors((prev) => ({
                ...prev,
                center: `Coordinates is required in format - {"lat":1.1,"lng":2.2}`,
              }));
            } else {
              delete validationErrors.center;
              setValidationErrors({ ...validationErrors });
            }
          },
        },
      },
      {
        accessorKey: "geofenceType",
        header: "Type",
        muiEditTextFieldProps: {
          error: !!validationErrors.geofenceType,
          helperText: validationErrors.geofenceType,
          required: true,
          type: "string",
          onChange: (event) => {
            const value = event.target.value;
            if (!value) {
              setValidationErrors((prev) => ({
                ...prev,
                geofenceType: "Geofence Type is required",
              }));
            } else {
              delete validationErrors.geofenceType;
              setValidationErrors({ ...validationErrors });
            }
          },
        },
      },
      {
        accessorKey: "radius",
        header: "Radius",
        muiEditTextFieldProps: {
          error: !!validationErrors.radius,
          helperText: validationErrors.radius,
          required: true,
          defaultValue: 30,
          onChange: (event) => {
            const value = event.target.value;
            if (!value) {
              setValidationErrors((prev) => ({
                ...prev,
                radius: "Radius is required",
              }));
            } else {
              delete validationErrors.radius;
              setValidationErrors({ ...validationErrors });
            }
          },
        },
      },
      {
        accessorKey: "scheduleArrival",
        header: "Schedule Arrival",
        muiEditTextFieldProps: {
          error: !!validationErrors.scheduleArrival,
          helperText: validationErrors.scheduleArrival,
          required: true,
          type: "string",
          onChange: (event) => {
            const value = event.target.value;
            if (!value) {
              setValidationErrors((prev) => ({
                ...prev,
                scheduleArrival: "Schedule Arrival is required",
              }));
            } else {
              delete validationErrors.scheduleArrival;
              setValidationErrors({ ...validationErrors });
            }
          },
        },
      },
      {
        accessorKey: "haltDuration",
        header: "Halt Duration",
        muiEditTextFieldProps: {
          error: !!validationErrors.haltDuration,
          helperText: validationErrors.haltDuration,
          required: true,
          onChange: (event) => {
            const value = event.target.value;
            if (!value) {
              setValidationErrors((prev) => ({
                ...prev,
                haltDuration: "Halt Duration is required",
              }));
            } else {
              delete validationErrors.haltDuration;
              setValidationErrors({ ...validationErrors });
            }
          },
        },
      },
      //end
    ],
    [validationErrors]
  );

  const handleSaveGeofence: MRT_TableOptions<Geofence>["onEditingRowSave"] =
    async ({ values, table, row }) => {
      const geofenceData = { ...values, id: row.id };

      const newValidationErrors = validateGeofence(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await updateGeofence(session?.token.idToken, geofenceData);
      table.setEditingRow(null);
    };

  //DELETE action
  const openDeleteConfirmModal = async (row: MRT_Row<Geofence>) => {
    if (
      window.confirm(
        `Are you sure you want to delete geofence ${row.original.tag} ?`
      )
    ) {
      await deleteGeofenceLocationById(session?.token.idToken, orgId as string, row.id);
    }
    setIsRefetching(true);
  };

  const seeGeofenceGroupOnMap = (selectedRow: any) => {
    const selectedGeofenceGroup = Object.keys(rowSelection).filter(
      (key) => rowSelection[key]
    );
    // console.info( selectedRow[0].geofenceLocationGroupName );
    // setSelectedGeofenceGroup(selectedGeofenceGroup);
    if (selectedGeofenceGroup) {
      const groupName = selectedRow[0].geofenceLocationGroupName;
      router.push(`/dashboard/geofences?query=${groupName}`);
      onClose();
    }
  };

  const table = useMaterialReactTable({
    columns,
    data,
    enableRowSelection: true,
    enableColumnActions: true,
    getRowId: (row) => row.id,
    initialState: { showColumnFilters: false },
    manualFiltering: true,
    manualPagination: true,
    muiPaginationProps: {
      rowsPerPageOptions: [10, 25, 50],
    },
    manualSorting: false,
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    rowCount,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onEditingRowSave: handleSaveGeofence,
    onEditingRowCancel: () => setValidationErrors({}),
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    renderRowActionMenuItems: ({ row, table }) => [
      <MRT_ActionMenuItem
        key={`delete-${row.id}`}
        icon={<DeleteIcon color="error" />}
        label="Delete"
        onClick={() => {
          openDeleteConfirmModal(row);
        }}
        table={table}
      />,
    ],
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h5">Edit Geofence</DialogTitle>
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
    renderTopToolbarCustomActions: ({ table }) => {
      const handleSeeGeofenceGroupOnMap = () => {
        const selectedRows = table
          .getSelectedRowModel()
          .rows.map((row) => row.original);
        seeGeofenceGroupOnMap(selectedRows); // Pass the selected rows to seeLocation
      };
      return (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* <Typography>{`${JSON.stringify(table.getSelectedRowModel().rows.map((row) => row.original))}`}</Typography> */}
            <Button
              disabled={
                Object.keys(rowSelection).length === 0 ||
                Object.keys(rowSelection).length > 1
              }
              onClick={handleSeeGeofenceGroupOnMap}
            >
              See Geofence Group on Map
            </Button>
          </div>
        </>
      );
    },
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
      rowSelection,
    },
  });

  return <MaterialReactTable table={table} />;
};

export default Geofences;

const validateRequired = (value: string) => !!value.length;
const validateRequiredNumber = (value: any) => {
  const numValue = Number(value);
  return !isNaN(numValue);
};

function validateGeofence(geofence: Geofence) {
  return {
    geofenceLocationGroupName: !validateRequired(
      geofence.geofenceLocationGroupName
    )
      ? "geofenceLocationGroupName is Required"
      : "",
    tag: !validateRequired(geofence.tag)
      ? "geofenceLocationGroupName is Required"
      : "",
    center: !validateRequired(geofence.center) ? "Coordinates is Required" : "",
    geofenceType: !validateRequired(geofence.geofenceType)
      ? "Geofence Type is Required"
      : "",
    scheduleArrival: !validateRequired(geofence.scheduleArrival)
      ? "Schedule Arrival is Required"
      : "",
    haltDuration: !validateRequiredNumber(geofence.haltDuration)
      ? "Halt Duration is Required"
      : "",
  };
}
