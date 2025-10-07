'use client';

import { GET_MANY_LOGS_DEFAULT_LIMIT } from '@deepcrawl/contracts';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTable,
} from '@deepcrawl/ui/components/reui/card';
import { DataGrid } from '@deepcrawl/ui/components/reui/data-grid';
import { DataGridPagination } from '@deepcrawl/ui/components/reui/data-grid-pagination';
import { DataGridTable } from '@deepcrawl/ui/components/reui/data-grid-table';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { Checkbox } from '@deepcrawl/ui/components/ui/checkbox';
import { Input } from '@deepcrawl/ui/components/ui/input';
import { Label } from '@deepcrawl/ui/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@deepcrawl/ui/components/ui/popover';
import { ScrollArea, ScrollBar } from '@deepcrawl/ui/components/ui/scroll-area';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Filter, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSuspenseGetManyLogs } from '@/hooks/logs.hooks';
import {
  type ActivityLogEntry,
  activityLogsColumns,
  getLogStatus,
} from './logs-columns';

const DEFAULT_PAGE_SIZE = GET_MANY_LOGS_DEFAULT_LIMIT;

export default function ActivityLogsDataGrid() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'timestamp', desc: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);

  const queryParams = useMemo(
    () => ({
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
    }),
    [pagination.pageIndex, pagination.pageSize],
  );

  const { data } = useSuspenseGetManyLogs(queryParams);

  const logs = useMemo<ActivityLogEntry[]>(() => data?.logs ?? [], [data]);

  useEffect(() => {
    if (pagination.pageIndex > 0 && logs.length === 0) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: Math.max(prev.pageIndex - 1, 0),
      }));
    }
  }, [logs.length, pagination.pageIndex]);

  const filteredData = useMemo(() => {
    return logs.filter((item) => {
      const matchesStatus =
        !selectedStatuses.length ||
        selectedStatuses.includes(getLogStatus(item));
      const matchesPath =
        !selectedPaths.length || selectedPaths.includes(item.path);
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        Object.values(item).join(' ').toLowerCase().includes(searchLower);
      return matchesStatus && matchesPath && matchesSearch;
    });
  }, [logs, searchQuery, selectedPaths, selectedStatuses]);

  const statusCounts = useMemo(() => {
    return logs.reduce(
      (acc, item) => {
        acc[getLogStatus(item)] = (acc[getLogStatus(item)] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [logs]);

  const pathCounts = useMemo(() => {
    return logs.reduce(
      (acc, item) => {
        acc[item.path] = (acc[item.path] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [logs]);

  const pathEntries = useMemo(() => {
    return Object.entries(pathCounts).sort((first, second) =>
      first[0].localeCompare(second[0], undefined, { sensitivity: 'base' }),
    );
  }, [pathCounts]);

  const hasNextPage = logs.length === pagination.pageSize;
  const recordCount =
    pagination.pageIndex * pagination.pageSize + filteredData.length;

  const handleStatusChange = (checked: boolean, value: string) => {
    setSelectedStatuses((prev = []) => {
      if (checked) {
        return prev.includes(value) ? prev : [...prev, value];
      }
      return prev.filter((candidate) => candidate !== value);
    });
  };
  const handlePathChange = (checked: boolean, value: string) => {
    setSelectedPaths((prev = []) => {
      if (checked) {
        return prev.includes(value) ? prev : [...prev, value];
      }
      return prev.filter((candidate) => candidate !== value);
    });
  };

  const [columnOrder, setColumnOrder] = useState<string[]>(
    activityLogsColumns.map((column) => column.id as string),
  );

  const table = useReactTable({
    columns: activityLogsColumns,
    data: filteredData,
    pageCount: hasNextPage
      ? pagination.pageIndex + 2
      : pagination.pageIndex + 1,
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
    manualPagination: true,
  });

  return (
    <DataGrid
      loadingMessage="Loading activity logs..."
      recordCount={recordCount}
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
          <div className="flex w-full items-center justify-between gap-2.5 max-sm:flex-col max-sm:items-start max-sm:gap-4">
            <div className="relative max-sm:w-full max-sm:flex-1">
              <Search className="-translate-y-1/2 absolute start-3 top-1/2 size-4 text-muted-foreground" />
              <Input
                className="sm;max-w-80 w-full min-w-60 ps-9 pe-9 max-sm:w-full"
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
            <div className="flex items-center gap-2.5 max-sm:w-full">
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="max-sm:flex-1" variant="outline">
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
                      Status
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
                          <Label
                            className="flex grow items-center justify-between gap-1.5 font-normal"
                            htmlFor={status}
                          >
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="max-sm:flex-1" variant="outline">
                    <Filter />
                    Path
                    {selectedPaths.length > 0 && (
                      <Badge variant="outline">{selectedPaths.length}</Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-60 p-3">
                  <div className="space-y-3">
                    <div className="font-medium text-muted-foreground text-xs">
                      Path
                    </div>
                    <div className="space-y-3">
                      {pathEntries.length > 0 ? (
                        pathEntries.map(([path, count], index) => {
                          const checkboxId = `path-filter-${index}`;
                          return (
                            <div
                              className="flex items-center gap-2.5"
                              key={path}
                            >
                              <Checkbox
                                checked={selectedPaths.includes(path)}
                                id={checkboxId}
                                onCheckedChange={(checked) =>
                                  handlePathChange(checked === true, path)
                                }
                              />
                              <Label
                                className="flex grow items-center justify-between gap-1.5 font-normal"
                                htmlFor={checkboxId}
                              >
                                <span className="truncate">{path}</span>
                                <span className="text-muted-foreground">
                                  {count}
                                </span>
                              </Label>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-muted-foreground text-xs">
                          No paths available
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
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
