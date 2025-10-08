import {
  getCoreRowModel,
  getFilteredRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  type ActivityLogEntry,
  activityLogsColumns,
} from '@/components/logs/logs-columns';

export interface UseLogsTableOptions {
  data: ActivityLogEntry[];
  pagination: PaginationState;
  sorting: SortingState;
  hasNextPage: boolean;
  onPaginationChange: (
    updater: PaginationState | ((previous: PaginationState) => PaginationState),
  ) => void;
  onSortingChange: React.Dispatch<React.SetStateAction<SortingState>>;
}

export function useLogsTable({
  data,
  pagination,
  sorting,
  hasNextPage,
  onPaginationChange,
  onSortingChange,
}: UseLogsTableOptions) {
  const [columnOrder, setColumnOrder] = useState<string[]>(
    activityLogsColumns.map((column) => column.id as string),
  );

  const table = useReactTable({
    columns: activityLogsColumns,
    data,
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
    onPaginationChange,
    onSortingChange,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
  });

  return table;
}
