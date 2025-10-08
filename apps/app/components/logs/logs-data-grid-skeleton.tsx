'use client';

import {
  Card,
  CardFooter,
  CardHeader,
  CardTable,
} from '@deepcrawl/ui/components/reui/card';
import { DataGrid } from '@deepcrawl/ui/components/reui/data-grid';
import { DataGridPagination } from '@deepcrawl/ui/components/reui/data-grid-pagination';
import { DataGridTable } from '@deepcrawl/ui/components/reui/data-grid-table';
import { Button } from '@deepcrawl/ui/components/ui/button';
import { Input } from '@deepcrawl/ui/components/ui/input';
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
import { Filter, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { type ActivityLogEntry, activityLogsColumns } from './logs-columns';

const DEFAULT_PAGE_SIZE = 10;

export function ActivityLogsSkeleton() {
  const [pagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
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
      <Card className="rounded-none border-none bg-transparent">
        <CardHeader className="w-full px-0 py-4">
          <div className="flex w-full items-center gap-2.5 max-sm:justify-between">
            <div className="relative max-sm:flex-1">
              <Search className="-translate-y-1/2 absolute start-3 top-1/2 size-4 text-muted-foreground" />
              <Input
                className="w-full min-w-60 max-w-80 ps-9 pe-9"
                disabled
                placeholder="Search..."
                value=""
              />
            </div>
            <div className="flex items-center gap-2.5 max-sm:w-full max-sm:justify-end">
              <Button disabled variant="outline">
                <Filter />
                Status
              </Button>
              <Button disabled variant="outline">
                <Filter />
                Path
              </Button>
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
