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

// import { Box, Typography, Button, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from '@tanstack/react-query'; //Note: this is TanStack React Query V5

import axios from 'axios';
import { useSession } from 'next-auth/react';
import { latestVehicleTelemetryReport } from '@/app/lib/telemetry-utils';
import { generateVehicleExcel, generateVehicleExcelAndDownload } from './report-export';
const nodeServerUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL;

//Your API response shape will probably be different. Knowing a total row count is important though.
type VehicleTelemetryReportApiResponse = {
  data: Array<VehicleTelemetryReport>;
  meta: {
    totalRowCount: number;
  };
};

export type VehicleTelemetryReport = {
  reportName: string;
  vehicleNumber: string;
  geofenceLocationGroupName: string;
  assignedGeofenceLocationCount: number;
  touchedLocationCount: number;
  mileage: number;
  startTimeToday: string;
};

const columns: MRT_ColumnDef<VehicleTelemetryReport>[] = [
  {
    header: 'Report',
    accessorKey: 'reportName',
  },
  {
    header: 'Vehicle Number',
    accessorKey: 'vehicleNumber',
  },
  {
    header: 'Owner',
    accessorKey: 'owner',
  },
  {
    header: 'Geofence Group',
    accessorKey: 'geofenceLocationGroupName',
  },
  {
    header: 'Assigned Geofence Location #',
    accessorKey: 'assignedGeofenceLocationCount',
  },
  {
    header: 'Touched Location #',
    accessorKey: 'touchedLocationCount',

    Cell: ({ row }) => {
      const touchedLocationCount = row.getValue('touchedLocationCount') as string;
      if(!touchedLocationCount){
        return <span>-</span>; 
      }
      return <span>{touchedLocationCount}</span>;
    }
  },
  {
      header: 'Touched Location %',
      accessorKey:'deviation',

      Cell: ({ row }) => {
        const assignedGeofenceLocationCount = row.getValue('assignedGeofenceLocationCount');
        const touchedLocationCount = row.getValue('touchedLocationCount');
        const percentage = ((touchedLocationCount as number?? 0) / (assignedGeofenceLocationCount as number ?? 1)) * 100;
        let percentageRounded = roundToDecimal(percentage, 1);

        let color = 'inherit';
        if (percentageRounded >= 90) {
          color = 'text-green-950 bg-green-700';
        }
        else if (percentageRounded >= 80 && percentageRounded < 90) {
          color = 'text-green-950 bg-green-600';
        }
        else if (percentageRounded >= 60 && percentageRounded < 80) {
          color = 'text-green-950 bg-green-500';
        }
        else if (percentageRounded >= 51 && percentageRounded < 60) {
          color = 'text-green-600 bg-green-100';
        }
        else if (percentageRounded >= 40 && percentageRounded < 51) {
          color = 'text-yellow-950 bg-yellow-500';
        }
        else if (percentageRounded >= 30 && percentageRounded < 40) {
          color = 'text-orange-950 bg-orange-500';
        }
        else if (percentageRounded >= 20 && percentageRounded < 30) {
          color = 'text-red-950 bg-red-500';
        }
        else if (percentageRounded >= 10 && percentageRounded < 20) {
          color = 'text-red-950 bg-red-700';
        }
        else if (percentageRounded < 10) {
          color = 'text-red-950 bg-red-800';
        }

        if(!percentageRounded){
          return <span>-</span>; 
        }
        return (
         <Typography className={`rounded-full px-2 py-1 ${color}`}  > {percentageRounded}</Typography>
        );
      },
  },
  {
    header: 'Mileage(km)',
    accessorKey: 'mileage',

    Cell: ({ row }) => {
      const mileage = row.getValue('mileage') as number;
      if(!mileage){
        return <span>-</span>; 
      }
      return <span>{mileage/1000}</span>;
    }
  },
  {
    header: 'Start Time Today',
    accessorKey: 'actualStartTime',
    Cell: ({ row }) => {
      const actualStartTime = row.getValue('actualStartTime') as string;
      if (!actualStartTime || isNaN(new Date(actualStartTime as string).getTime())) {
        return <span>-</span>; // Return placeholder for null or invalid date
      }
      const localTime = new Date(actualStartTime).toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      return <span>{localTime}</span>;
    },
  },

  // {
  //   header: 'Touched Location',
  //   accessorKey: 'touchedLocation',
  //   Cell: ({ row }) => (row.original.touchedLocation ? 
  //   <span className="text-green-500  bg-green-300 rounded-full px-2 py-1">Yes</span> 
  //     :  <span className="text-red-500 bg-red-300 rounded-full px-2 py-1">No</span>),
  // },
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
  const orgId = session?.user?.orgId;

  const { data, fetchNextPage, isError, isFetching, isLoading } =
    useInfiniteQuery<VehicleTelemetryReportApiResponse>({
      queryKey: [
        'table-data',
        columnFilters, //refetch when columnFilters changes
        globalFilter, //refetch when globalFilter changes
        sorting, //refetch when sorting changes
      ],
      queryFn: async ({ pageParam }) => {
        // const orgId='bmc'; //TODO remove hardcoding
        const url = new URL(
          '/node/api/vehicleTelemetryData/vehicle/report',
          nodeServerUrl,
        );
        url.searchParams.set('start', `${(pageParam as number) * fetchSize}`);
        url.searchParams.set('size', `${fetchSize}`);
        url.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
        url.searchParams.set('globalFilter', globalFilter ?? '');
        url.searchParams.set('sorting', JSON.stringify(sorting ?? []));
        url.searchParams.set('orgId', orgId as string);

        // const response = await fetch(url.href);
        const response = await axios.get(url.toString());

        // console.log(`data received ${JSON.stringify(response.data)}`);
        // const json = (await response.json()) as VehicleTelemetryReportApiResponse;       
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

  const handleExportData = async () => {
    const reportData = await latestVehicleTelemetryReport(orgId as string);
    const xlsFilePath = await generateVehicleExcelAndDownload(reportData);
    // const csv = generateCsv(csvConfig)(data);
  };

  const table = useMaterialReactTable({
    columns,
    data: flatData,
    enableColumnActions: false,
    enableColumnResizing: true,
    enablePagination: false,
    enableRowNumbers: true,
    enableRowVirtualization: true,
    manualFiltering: true,
    manualSorting: true,
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
    renderTopToolbarCustomActions: ({ table }) => (
      <Box
        sx={{
          display: 'flex',
          gap: '16px',
          padding: '8px',
          flexWrap: 'wrap',
          justifyContent: 'flex-end', 
        }}
      >
        <Tooltip title="Download latest vehicle report" placement="top">
        <Button
          sx={{
            color:'grey',
          }}
          onClick={handleExportData}
          startIcon={<FileDownloadIcon />}
        >
        </Button>
        </Tooltip>
      </Box>
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


const roundToDecimal = (value: number, decimals: number) => {
  return parseFloat(value.toFixed(decimals));
};