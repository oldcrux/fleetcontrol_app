import { useEffect, useMemo, useState } from 'react';
import {
  MaterialReactTable,
  MRT_ActionMenuItem,
  MRT_Row,
  MRT_TableOptions,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from 'material-react-table';
import { useSession } from "next-auth/react";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from '../button';
import { deleteGeofenceLocation, deleteGeofenceLocationById, updateGeofence } from '@/app/lib/geofence-utils';

import {
    useQueryClient,
    useMutation,
  } from "@tanstack/react-query";

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

type UserApiResponse = {
  data: Array<Geofence>;
  meta: {
    totalRowCount: number;
  };
};

type Geofence = {
    geofenceLocationGroupName: string;
    center: string;
    tag: string;
    geofenceType: string,
    radius:number,
    scheduleArrival: number,
    haltDuration: number,
    id:string,
}

const Geofences = () => {
  //data and fetching state
  const [data, setData] = useState<Geofence[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  
  const { data: session } = useSession();
  const orgId = session?.user?.orgId;

  //table state
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!data.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      let path = `/node/api/geofence/fetch?orgId=${orgId}`;

      const url = new URL(`${nodeServerUrl}${path}`, location.origin);
      url.searchParams.set(
        'start',
        `${pagination.pageIndex * pagination.pageSize}`,
      );
      url.searchParams.set('size', `${pagination.pageSize}`);
      url.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
      url.searchParams.set('globalFilter', globalFilter ?? '');
      url.searchParams.set('sorting', JSON.stringify(sorting ?? []));

      try {
        const response = await fetch(url.href);
        const json = (await response.json()) as UserApiResponse;
        
        // console.log(`data fetched`, json.data);
        // console.log(`meta fetched`, json.meta);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    columnFilters, //re-fetch when column filters change
    globalFilter, //re-fetch when global filter changes
    pagination.pageIndex, //re-fetch when page index changes
    pagination.pageSize, //re-fetch when page size changes
    sorting, //re-fetch when sorting changes
    isRefetching,
  ]);

  const columns = useMemo<MRT_ColumnDef<Geofence>[]>(
    () => [
      {
        accessorKey: 'geofenceLocationGroupName',
        header: 'Geofence Location Group',
      },
      //column definitions...
      {
        accessorKey: 'tag',
        header: 'Tag',
      },
      {
        accessorKey: 'center',
        header: 'Coordinates',
      },
      {
        accessorKey: 'geofenceType',
        header: 'Type',
      },
      {
        accessorKey: 'radius',
        header: 'Radius',
      },
      {
        accessorKey: 'scheduleArrival',
        header: 'Schedule Arrival',
      },
      {
        accessorKey: 'haltDuration',
        header: 'Halt Duration',
      },
      //end
    ],
    [],
  );

  //call UPDATE hook
//   const { mutateAsync: updateGeofence, isPending: isUpdatingGeofence } =
//     useUpdateGeofence();
  

  //UPDATE action
  const handleSaveGeofence: MRT_TableOptions<Geofence>["onEditingRowSave"] =
    async ({ values, table, row }) => {
    //   const newValidationErrors = validateVehicle(values);
    //   if (Object.values(newValidationErrors).some((error) => error)) {
    //     setValidationErrors(newValidationErrors);
    //     return;
    //   }
    //   setValidationErrors({});
    // console.log(`updating values`, values, row.id);
    const geofenceData = {...values, id: row.id};
      await updateGeofence(geofenceData);
      table.setEditingRow(null); //exit editing mode
    };

  //DELETE action
  const openDeleteConfirmModal = async (row: MRT_Row<Geofence>) => {
    if (window.confirm(`Are you sure you want to delete geofence ${row.original.tag} ?`)) {
      await deleteGeofenceLocationById(orgId as string, row.id);
    }
    setIsRefetching(true);
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
    manualSorting: true,
    muiToolbarAlertBannerProps: isError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,

    // onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveGeofence,
    createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    renderRowActionMenuItems: ({ row, table }) => [
        <MRT_ActionMenuItem
          icon={<DeleteIcon color="error" />}
          key={`delete-${row.id}`}
          label="Delete"
          onClick={() => {
            openDeleteConfirmModal(row);
          }}
          table={table}
        />,
      ],

    // renderTopToolbarCustomActions: ({ table }) => (
    //     <>
    //     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    //     <Button 
    //       onClick={() => {
    //         // console.log(`setting creating flag to true`);
    //         // setCreating(true);
    //         table.setCreatingRow(true); //simplest way to open the create row modal with no default values
    //         //or you can pass in a row object to set default values with the `createRow` helper function
    //         // table.setCreatingRow(
    //         //   createRow(table, {
    //         //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
    //         //   }),
    //         // );
    //       }}
    //     >
    //       Delete
    //     </Button>
        
  
    //      </div>
    //     </>
    //   ),

    rowCount,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
    //   isSaving: isUpdatingGeofence,
      sorting,
    },
  });

  return <MaterialReactTable table={table} />;
};


// function useUpdateGeofence() {
//     const queryClient = useQueryClient();
  
//     const { data: session } = useSession();
//     const orgId = session?.user?.orgId;
  
//     return useMutation({
//       mutationFn: async (geofence: Geofence) => {
//         const status = await updateGeofence(geofence);
//         return Promise.resolve(status);
//       },
//       //client side optimistic update
//       onMutate: (newVehicleInfo: Geofence) => {
//         // queryClient.setQueryData(["vehicles"], (prevVehicles: any) =>
//         //   prevVehicles?.map((prevVehicle: Vehicle) =>
//         //     prevVehicle.vehicleNumber === newVehicleInfo.vehicleNumber
//         //       ? newVehicleInfo
//         //       : prevVehicle
//         //   )
//         // );
//       },
//       // onSettled: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }), //refetch vehicles after mutation, disabled for demo
//     });
//   }

export default Geofences;
