import {
  DataGrid,
  DataGridContainer,
} from '@deepcrawl/ui/components/reui/data-grid';
import { DataGridColumnHeader } from '@deepcrawl/ui/components/reui/data-grid-column-header';
import { DataGridPagination } from '@deepcrawl/ui/components/reui/data-grid-pagination';
import { DataGridTable } from '@deepcrawl/ui/components/reui/data-grid-table';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { ScrollArea, ScrollBar } from '@deepcrawl/ui/components/ui/scroll-area';
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import type { GetManyLogsResponse } from 'deepcrawl';
import { useEffect, useMemo, useState } from 'react';

type ActivityLogEntry = GetManyLogsResponse['logs'][number];

type ActivityLogStatus = 'success' | 'failed';

function getLogUrl(log: ActivityLogEntry): string {
  return log.requestOptions.url;
}

function getLogStatus(log: ActivityLogEntry): ActivityLogStatus {
  const { response } = log;

  if (typeof response === 'string') {
    return 'success';
  }

  if ('success' in response) {
    return response.success ? 'success' : 'failed';
  }

  return 'failed';
}

function getLogTimestamp(log: ActivityLogEntry): string | undefined {
  const { response } = log;

  if (typeof response === 'string') {
    return;
  }

  if ('timestamp' in response && typeof response.timestamp === 'string') {
    return response.timestamp;
  }

  return;
}

function formatTimestamp(timestamp?: string): string {
  if (!timestamp) {
    return '--';
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

interface DataGridProps {
  readonly logs: GetManyLogsResponse['logs'];
}

export default function DataGridDemo({ logs }: DataGridProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'timestamp', desc: true },
  ]);

  const columns = useMemo<ColumnDef<ActivityLogEntry>[]>(
    () => [
      {
        accessorKey: 'id',
        id: 'id',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Request ID" visibility />
        ),
        cell: ({ getValue }) => (
          <code className="font-mono text-muted-foreground text-xs">
            {getValue<string>()}
          </code>
        ),
        size: 220,
        enableSorting: true,
        enableHiding: false,
        enableResizing: true,
      },
      {
        accessorKey: 'path',
        id: 'path',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Path" visibility />
        ),
        cell: ({ getValue }) => (
          <span className="text-foreground text-sm">{getValue<string>()}</span>
        ),
        size: 160,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorFn: (log) => getLogUrl(log),
        id: 'url',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="URL" visibility />
        ),
        cell: ({ row }) => {
          const url = getLogUrl(row.original);

          return <span className="truncate text-primary text-sm">{url}</span>;
        },
        size: 320,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorFn: (log) => getLogTimestamp(log) ?? '',
        id: 'timestamp',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Time" visibility />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {formatTimestamp(getLogTimestamp(row.original))}
          </span>
        ),
        size: 200,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorFn: (log) => getLogStatus(log),
        id: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Status" visibility />
        ),
        cell: ({ row }) => {
          const status = getLogStatus(row.original);

          return (
            <Badge
              className="capitalize"
              variant={status === 'success' ? 'outline' : 'destructive'}
            >
              {status}
            </Badge>
          );
        },
        size: 120,
        enableSorting: true,
        enableHiding: true,
        enableResizing: false,
      },
    ],
    [],
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string),
  );

  const recordCount = logs.length;
  const pageCount = Math.max(1, Math.ceil(recordCount / pagination.pageSize));

  useEffect(() => {
    if (pagination.pageIndex >= pageCount) {
      setPagination((previous) => ({ ...previous, pageIndex: 0 }));
    }
  }, [pageCount, pagination.pageIndex]);

  const table = useReactTable({
    columns,
    data: logs,
    pageCount,
    getRowId: (row: ActivityLogEntry) => row.id,
    state: {
      pagination,
      sorting,
      columnOrder,
    },
    columnResizeMode: 'onChange',
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DataGrid
      recordCount={recordCount}
      table={table}
      tableLayout={{
        columnsPinnable: true,
        columnsResizable: true,
        columnsMovable: true,
        columnsVisibility: true,
        columnsDraggable: true,
      }}
    >
      <DataGridContainer>
        <ScrollArea className="w-full overflow-x-hidden">
          <DataGridTable />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </DataGridContainer>
      <DataGridPagination />
    </DataGrid>
  );
}
