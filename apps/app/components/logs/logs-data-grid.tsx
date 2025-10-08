'use client';

import { resolveGetManyLogsOptions } from '@deepcrawl/contracts';
import {
  GET_MANY_LOGS_DEFAULT_LIMIT,
  GET_MANY_LOGS_DEFAULT_SORT_COLUMN,
  GET_MANY_LOGS_DEFAULT_SORT_DIRECTION,
} from '@deepcrawl/types/configs/default';
import type {
  GetManyLogsSortColumn,
  GetManyLogsSortDirection,
} from '@deepcrawl/types/routers/logs';
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
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Filter, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useSuspenseGetManyLogs } from '@/hooks/logs.hooks';
import {
  DEFAULT_LOGS_DATE_RANGE_PRESET,
  type LogsDateRangePreset,
} from '@/lib/logs/config';
import type { LogsDateRange } from '@/lib/logs/types';
import {
  createLogsDateRangeFromDates,
  createLogsDateRangeFromPreset,
} from '@/utils/logs';
import {
  type ActivityLogEntry,
  activityLogsColumns,
  getLogStatus,
} from './logs-columns';
import {
  LogsDateRangeSelect,
  type LogsDateRangeSelectValue,
} from './logs-date-range-select';

const COLUMN_TO_SORT_COLUMN: Record<string, GetManyLogsSortColumn> = {
  timestamp: 'requestTimestamp',
  path: 'path',
  url: 'requestUrl',
  status: 'success',
};

export default function ActivityLogsDataGrid() {
  const [pagination, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: GET_MANY_LOGS_DEFAULT_LIMIT,
  });
  const setPagination = useCallback(
    (
      updater:
        | PaginationState
        | ((previous: PaginationState) => PaginationState),
    ) => {
      setPaginationState((previous) => {
        const nextState =
          typeof updater === 'function'
            ? (updater as (prev: PaginationState) => PaginationState)(previous)
            : updater;
        return nextState;
      });
    },
    [],
  );
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'timestamp', desc: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [datePreset, setDatePreset] = useState<LogsDateRangeSelectValue>(
    DEFAULT_LOGS_DATE_RANGE_PRESET,
  );
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(
    undefined,
  );
  const [activeRange, setActiveRange] = useState<LogsDateRange>(() =>
    createLogsDateRangeFromPreset(DEFAULT_LOGS_DATE_RANGE_PRESET),
  );

  const { orderBy, orderDir } = useMemo(() => {
    const [primary] = sorting;
    if (!primary) {
      return {
        orderBy: GET_MANY_LOGS_DEFAULT_SORT_COLUMN,
        orderDir: GET_MANY_LOGS_DEFAULT_SORT_DIRECTION,
      };
    }

    const mapped =
      COLUMN_TO_SORT_COLUMN[primary.id] ?? GET_MANY_LOGS_DEFAULT_SORT_COLUMN;
    const direction: GetManyLogsSortDirection =
      primary.desc === false ? 'asc' : 'desc';

    return {
      orderBy: mapped,
      orderDir: direction,
    };
  }, [sorting]);

  const queryOptions = useMemo(
    () =>
      resolveGetManyLogsOptions({
        startDate: activeRange.startDate,
        endDate: activeRange.endDate,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        orderBy,
        orderDir,
      }),
    [
      activeRange.endDate,
      activeRange.startDate,
      orderBy,
      orderDir,
      pagination.pageIndex,
      pagination.pageSize,
    ],
  );

  const { data } = useSuspenseGetManyLogs(queryOptions);

  const logs = data.logs;
  const meta = data.meta;

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

  const hasNextPage = meta.hasMore;
  const recordCount =
    meta.offset + filteredData.length + (meta.hasMore ? 1 : 0);

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

  // Track previous date range to only reset pagination when dates actually change
  const prevDateRangeRef = useRef<string>(
    `${activeRange.startDate}|${activeRange.endDate}`,
  );

  // Anytime we switch the range (and therefore fetch a different slice of logs), it snaps the grid back to page 1
  useEffect(() => {
    const currentRange = `${activeRange.startDate}|${activeRange.endDate}`;
    if (prevDateRangeRef.current !== currentRange) {
      prevDateRangeRef.current = currentRange;
      setPagination((prev) =>
        prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 },
      );
    }
  }, [activeRange.endDate, activeRange.startDate, setPagination]);

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
    manualSorting: true,
    columnResizeMode: 'onChange',
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
          <div className="flex w-full items-center gap-2.5 max-sm:flex-col max-sm:items-start max-sm:gap-4">
            <div className="relative max-sm:w-full max-sm:flex-1">
              <Search className="-translate-y-1/2 absolute start-3 top-1/2 size-4 text-muted-foreground" />
              <Input
                className="w-full min-w-60 ps-9 pe-9 max-sm:w-full sm:max-w-80"
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
              <LogsDateRangeSelect
                appliedRange={activeRange}
                className="max-sm:flex-1"
                customRange={customDateRange}
                onCustomRangeChange={(range) => {
                  if (!(range?.from || range?.to)) {
                    setCustomDateRange(undefined);
                    return;
                  }

                  if (range?.from && !range?.to) {
                    setCustomDateRange({
                      from: new Date(range.from),
                      to: undefined,
                    });
                    return;
                  }

                  if (range?.from && range?.to) {
                    const fromDate = new Date(range.from);
                    const toDate = new Date(range.to);
                    setCustomDateRange({ from: fromDate, to: toDate });
                    setActiveRange(
                      createLogsDateRangeFromDates(fromDate, toDate),
                    );
                    setDatePreset('custom');
                  }
                }}
                onValueChange={(nextValue) => {
                  if (nextValue === 'custom') {
                    setDatePreset('custom');
                    return;
                  }

                  const preset = nextValue as LogsDateRangePreset;
                  setDatePreset(preset);
                  setCustomDateRange(undefined);
                  setActiveRange(createLogsDateRangeFromPreset(preset));
                }}
                value={datePreset}
              />
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
