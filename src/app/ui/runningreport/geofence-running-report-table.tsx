"use client"
import {
  type UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_SortingState,
  type MRT_RowVirtualizer,
} from 'material-react-table';
import Typography from '@mui/material/Typography';
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from '@tanstack/react-query'; //Note: this is TanStack React Query V5

import axios from 'axios';
import { useSession } from 'next-auth/react';

const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

//Your API response shape will probably be different. Knowing a total row count is important though.
type GeofenceTelemetryReportApiResponse = {
  data: Array<GeofenceTelemetryReport>;
  meta: {
    totalRowCount: number;
  };
};

export type GeofenceTelemetryReport = {
  reportName: string;
  vehicleNumber: string;
  geofenceLocationGroupName: string;
  geofenceLocationTag: string;
  touchedLocation: boolean;
  timeSpent: string;
};

const columns: MRT_ColumnDef<GeofenceTelemetryReport>[] = [
  {
    header: 'Report',
    accessorKey: 'reportName',
    // enableColumnFilter: false
  },
  {
    header: 'Vehicle Number',
    accessorKey: 'vehicleNumber',
  },
  {
    header: 'Geofence Group',
    accessorKey: 'geofenceLocationGroupName',
  },
  {
    header: 'Geofence Location',
    accessorKey: 'geofenceLocationTag',
  },
  {
    header: 'Touched Location',
    accessorKey: 'touchedLocation',
    Cell: ({ row }) => (row.original.touchedLocation ? 
    <span className="text-green-800  bg-green-400 rounded-full px-2 py-1">Yes</span> 
      :  <span className="text-red-800 bg-red-400 rounded-full px-2 py-1">No</span>),
  },
  {
    header: 'Allocated Halt Duration(Mins)',
    accessorKey: 'allocatedHaltDuration',
  },
  {
    header: 'Time Spent(Mins)',
    accessorKey: 'timeSpent',
  },
  {
    header: 'Schedule Arrival Time',
    accessorKey: 'scheduleArrivalTime',
    Cell: ({ row }) => {
      const scheduleArrivalTime = row.getValue('scheduleArrivalTime') as string;
      if (!scheduleArrivalTime ) {
        return <span>-</span>;
      }
      const formattedScheduleArrivalTime = scheduleArrivalTime.split(':').slice(0, 2).join(':');
      return <span>{formattedScheduleArrivalTime}</span>;
    },
  },
  {
    header: 'Arrival Time',
    accessorKey: 'arrivalTime',
    Cell: ({ row }) => {
      const arrivalTime = row.getValue('arrivalTime') as string;
      if (!arrivalTime || isNaN(new Date(arrivalTime as string).getTime())) {
        return <span>-</span>;
      }
      const localTime = new Date(arrivalTime).toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      return <span>{localTime}</span>;
    },
  },
  {
    header: 'Departure Time',
    accessorKey: 'departureTime',
    Cell: ({ row }) => {
      const departureTime = row.getValue('departureTime') as string;
      if (!departureTime || isNaN(new Date(departureTime as string).getTime())) {
        return <span>-</span>;
      }
      const localTime = new Date(departureTime).toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      return <span>{localTime}</span>;
    },
  },
];

const fetchSize = 5;

const GeofenceReport = () => {
  const tableContainerRef = useRef<HTMLDivElement>(null); //we can get access to the underlying TableContainer element and react to its scroll events
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null); //we can get access to the underlying Virtualizer instance and call its scrollToIndex method

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = useState<string>();
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const { data: session } = useSession();
  const orgId = session?.user?.secondaryOrgId ? session?.user?.secondaryOrgId : session?.user?.primaryOrgId;
  const vendorId = session?.user?.secondaryOrgId ? session?.user?.primaryOrgId : '';

  const { data, fetchNextPage, isError, isFetching, isLoading } =
    useInfiniteQuery<GeofenceTelemetryReportApiResponse>({
      queryKey: [
        'table-data',
        columnFilters, //refetch when columnFilters changes
        globalFilter, //refetch when globalFilter changes
        sorting, //refetch when sorting changes
      ],
      queryFn: async ({ pageParam }) => {
        // const orgId='bmc'; //TODO remove hardcoding
        const url = new URL(
          '/node/api/vehicleTelemetryData/geofence/report',
          nodeServerUrl,
        );
        url.searchParams.set('start', `${(pageParam as number) * fetchSize}`);
        url.searchParams.set('size', `${fetchSize}`);
        url.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
        url.searchParams.set('globalFilter', globalFilter ?? '');
        url.searchParams.set('sorting', JSON.stringify(sorting ?? []));
        url.searchParams.set('orgId', orgId as string);

        // const response = await fetch(url.href);
        const response = await axios.get(url.toString(), 
        {
          headers: {
            Authorization: `Bearer ${session?.token.idToken}`,
          },
          // withCredentials: true,
        });

        // console.log(`data received ${JSON.stringify(response.data)}`);
        // const json = (await response.json()) as GeofenceTelemetryReportApiResponse;       
        return response.data;
      },
      initialPageParam: 0,
      getNextPageParam: (_lastGroup, groups) => groups.length,
      refetchOnWindowFocus: false,
    });

  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = flatData.length;

  //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        //once the user has scrolled within 400px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 400 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount],
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
    enableColumnResizing: true,
    enablePagination: false,
    enableRowNumbers: true,
    enableRowVirtualization: true,
    manualFiltering: true,
    manualSorting: false,
    enableSorting: false,
    // enableGlobalFilter: false,
    // enableFilters: false,
    enableDensityToggle:false,
    // initialState: {
    //   density: 'compact',
    // },
    muiTableContainerProps: {
      ref: tableContainerRef, //get access to the table container element
      sx: { maxHeight: '600px' }, //give the table a max height
      onScroll: (event: UIEvent<HTMLDivElement>) =>
        fetchMoreOnBottomReached(event.target as HTMLDivElement), //add an event listener to the table container element
    },
    muiToolbarAlertBannerProps: isError
      ? {
          color: 'error',
          children: 'Error loading data',
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

const queryClient = new QueryClient();

const GeofenceReportWithReactQueryProvider = () => (
  //App.tsx or AppProviders file. Don't just wrap this component with QueryClientProvider! Wrap your whole App!
  <QueryClientProvider client={queryClient}>
    <GeofenceReport />
  </QueryClientProvider>
);

export default GeofenceReportWithReactQueryProvider;
