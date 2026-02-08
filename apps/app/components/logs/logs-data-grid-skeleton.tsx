'use client';

import {
  LIST_LOGS_DEFAULT_LIMIT,
  LIST_LOGS_DEFAULT_OFFSET,
} from '@deepcrawl/types/configs/default';
import { DataGrid } from '@deepcrawl/ui/components/reui/data-grid';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { Input } from '@deepcrawl/ui/components/ui/input';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDownIcon, Filter, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { type ActivityLogEntry, activityLogsColumns } from './logs-columns';
import { LogsDataGridCard } from './logs-data-grid-card';

export function ActivityLogsSkeleton() {
  'use no memo';

  const [pagination] = useState<PaginationState>({
    pageIndex: LIST_LOGS_DEFAULT_OFFSET,
    pageSize: LIST_LOGS_DEFAULT_LIMIT,
  });
  const [sorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);

  const [columnOrder, setColumnOrder] = useState<string[]>(
    activityLogsColumns.map((column) => column.id as string),
  );

  const table = useReactTable({
    columns: activityLogsColumns,
    data: [] as ActivityLogEntry[],
    pageCount: 1,
    state: {
      pagination,
      sorting,
      columnOrder,
    },
    columnResizeMode: 'onChange',
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  });

  const recordCount = useMemo(() => 0, []);

  return (
    <DataGrid
      isLoading
      loadingMessage="Loading activity logs..."
      loadingMode="skeleton"
      recordCount={recordCount}
      table={table}
      tableLayout={{
        columnsPinnable: true,
        columnsResizable: true,
        columnsMovable: true,
        columnsVisibility: true,
      }}
    >
      <LogsDataGridCard>
        <div className="flex w-full items-center justify-between gap-x-2 max-sm:flex-col max-sm:items-start max-sm:gap-4">
          <div className="flex w-full items-center gap-2.5 max-sm:flex-col max-sm:items-start max-sm:gap-4">
            <div className="max-sm:w-full max-sm:flex-1">
              <div className="relative max-sm:w-full max-sm:flex-1">
                <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="w-full min-w-60 ps-9 pe-9 max-sm:w-full sm:max-w-80"
                  disabled
                  placeholder="Search..."
                  value=""
                />
              </div>
            </div>
            <div className="flex items-center gap-2.5 max-sm:w-full">
              <Button className="max-sm:flex-1" disabled variant="outline">
                <Filter />
                Status
              </Button>
              <Button className="max-sm:flex-1" disabled variant="outline">
                <Filter />
                Path
              </Button>
            </div>
          </div>
          <Button
            className="w-fit justify-between font-normal max-sm:w-full max-sm:flex-1"
            disabled
            variant="outline"
          >
            <span className="truncate">Select date range</span>
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </LogsDataGridCard>
    </DataGrid>
  );
}
