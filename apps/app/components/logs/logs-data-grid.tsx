import {
  Card,
  CardFooter,
  CardHeader,
  CardTable,
} from '@deepcrawl/ui/components/reui/card';
import { DataGrid } from '@deepcrawl/ui/components/reui/data-grid';
import { DataGridColumnHeader } from '@deepcrawl/ui/components/reui/data-grid-column-header';
import { DataGridPagination } from '@deepcrawl/ui/components/reui/data-grid-pagination';
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@deepcrawl/ui/components/reui/data-grid-table';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { Checkbox } from '@deepcrawl/ui/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@deepcrawl/ui/components/ui/dropdown-menu';
import { Input } from '@deepcrawl/ui/components/ui/input';
import { Label } from '@deepcrawl/ui/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@deepcrawl/ui/components/ui/popover';
import { ScrollArea, ScrollBar } from '@deepcrawl/ui/components/ui/scroll-area';
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import type { GetManyLogsResponse } from 'deepcrawl';
import { Ellipsis, Filter, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/utils/clipboard';

type ActivityLogEntry = GetManyLogsResponse['logs'][number];

function getLogUrl(log: ActivityLogEntry): string {
  return log.requestOptions.url;
}

function getLogStatus(log: ActivityLogEntry): string {
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
  const { response, path } = log;

  if (typeof response === 'string') {
    // for getMarkdown, the requestTimestamp from the log is the request timestamp
    return path === 'read-getMarkdown' ? log.requestTimestamp : undefined;
  }

  if ('timestamp' in response && typeof response.timestamp === 'string') {
    return response.timestamp;
  }

  return;
}
// TODO: USE DATA-FNS TO FORMAT TIMESTAMP
function formatTimestamp(timestamp?: string): string {
  if (!timestamp) {
    return '--';
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return formatDate(date, 'MMM d, yyyy HH:mm');
}

function ActionsCell({ row }: { row: Row<ActivityLogEntry> }) {
  const handleCopyId = () => {
    copyToClipboard(row.original.id);
    const message = 'Request ID successfully copied';
    toast.success(message);
  };
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button className="size-7" variant="ghost">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom">
        <DropdownMenuItem onClick={() => {}}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyId}>Copy ID</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {}} variant="destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface DataGridProps {
  readonly logs: GetManyLogsResponse['logs'];
}

export default function ActivityLogsDataGrid({ logs }: DataGridProps) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'timestamp', desc: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const filteredData = useMemo(() => {
    return logs.filter((item) => {
      // Filter by status
      const matchesStatus =
        !selectedStatuses?.length ||
        selectedStatuses.includes(getLogStatus(item));
      // Filter by search query (case-insensitive)
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        Object.values(item)
          .join(' ') // Combine all fields into a single string
          .toLowerCase()
          .includes(searchLower);
      return matchesStatus && matchesSearch;
    });
  }, [searchQuery, selectedStatuses]);

  const statusCounts = useMemo(() => {
    return logs.reduce(
      (acc, item) => {
        acc[getLogStatus(item)] = (acc[getLogStatus(item)] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, []);

  const handleStatusChange = (checked: boolean, value: string) => {
    setSelectedStatuses(
      (
        prev = [], // Default to an empty array
      ) => (checked ? [...prev, value] : prev.filter((v) => v !== value)),
    );
  };

  const columns = useMemo<ColumnDef<ActivityLogEntry>[]>(
    () => [
      {
        accessorKey: 'id',
        id: 'id',
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        size: 20,
        enableSorting: false,
        enableHiding: false,
        meta: {
          headerClassName: '',
          cellClassName: '',
        },
        enableResizing: false,
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
        size: 20,
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
        size: 100,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        accessorFn: (log) => getLogTimestamp(log) ?? '',
        id: 'timestamp',
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title="Request Time"
            visibility
          />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {formatTimestamp(getLogTimestamp(row.original))}
          </span>
        ),
        size: 35,
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
        size: 20,
        enableSorting: true,
        enableHiding: true,
        enableResizing: true,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionsCell row={row} />,
        size: 20,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
      },
    ],
    [],
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((column) => column.id as string),
  );

  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: Math.ceil((filteredData.length || 0) / pagination.pageSize),
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
      recordCount={filteredData.length || 0}
      table={table}
      tableLayout={{
        columnsPinnable: true,
        columnsResizable: true,
        columnsMovable: true,
        columnsVisibility: true,
      }}
    >
      <Card className="rounded-none border-none bg-transparent">
        <CardHeader className="w-full px-0 py-4">
          <div className="flex w-full items-center gap-2.5 max-sm:justify-between">
            <div className="relative max-sm:flex-1">
              <Search className="-translate-y-1/2 absolute start-3 top-1/2 size-4 text-muted-foreground" />
              <Input
                className="w-full min-w-60 max-w-80 ps-9 pe-9"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                value={searchQuery}
              />
              {searchQuery.length > 0 && (
                <Button
                  className="-translate-y-1/2 absolute end-1.5 top-1/2 h-6 w-6"
                  onClick={() => setSearchQuery('')}
                  variant="ghost"
                >
                  <X />
                </Button>
              )}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter />
                  Status
                  {selectedStatuses.length > 0 && (
                    <Badge variant="outline">{selectedStatuses.length}</Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-40 p-3">
                <div className="space-y-3">
                  <div className="font-medium text-muted-foreground text-xs">
                    Filters
                  </div>
                  <div className="space-y-3">
                    {Object.keys(statusCounts).map((status) => (
                      <div className="flex items-center gap-2.5" key={status}>
                        <Checkbox
                          checked={selectedStatuses.includes(status)}
                          id={status}
                          onCheckedChange={(checked) =>
                            handleStatusChange(checked === true, status)
                          }
                        />
                        <Label className="flex grow items-center justify-between gap-1.5 font-normal">
                          {status}
                          <span className="text-muted-foreground">
                            {statusCounts[status]}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardTable>
          <ScrollArea className="w-full overflow-x-hidden">
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardTable>
        <CardFooter>
          <DataGridPagination />
        </CardFooter>
      </Card>
    </DataGrid>
  );
}
