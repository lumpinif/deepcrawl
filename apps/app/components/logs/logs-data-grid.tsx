'use client';

import { DataGrid } from '@deepcrawl/ui/components/reui/data-grid';
import { useEffect, useRef } from 'react';
import { useLogsData } from '@/hooks/use-logs-data';
import { useLogsDateRange } from '@/hooks/use-logs-date-range';
import { useLogsFilters } from '@/hooks/use-logs-filters';
import { useLogsPagination } from '@/hooks/use-logs-pagination';
import { useLogsSorting } from '@/hooks/use-logs-sorting';
import { useLogsTable } from '@/hooks/use-logs-table';
import { LogsDataGridCard } from './logs-data-grid-card';
import { LogsToolbar } from './logs-toolbar';

export default function ActivityLogsDataGrid() {
  const { pagination, setPagination } = useLogsPagination();
  const { sorting, setSorting, orderBy, orderDir } = useLogsSorting();
  const { searchQuery, selectedStatuses, selectedPaths } = useLogsFilters();
  const { activeRange } = useLogsDateRange();

  const { filteredLogs, statusOptions, pathOptions, hasNextPage, recordCount } =
    useLogsData({
      dateRange: activeRange,
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      orderBy,
      orderDir,
      searchQuery,
      selectedStatuses,
      selectedPaths,
    });

  const table = useLogsTable({
    data: filteredLogs,
    pagination,
    sorting,
    hasNextPage,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
  });

  // Reset pagination when date range changes
  const prevDateRangeRef = useRef<string>(
    `${activeRange.startDate}|${activeRange.endDate}`,
  );

  useEffect(() => {
    const currentRange = `${activeRange.startDate}|${activeRange.endDate}`;
    if (prevDateRangeRef.current !== currentRange) {
      prevDateRangeRef.current = currentRange;
      setPagination((prev) =>
        prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 },
      );
    }
  }, [activeRange.endDate, activeRange.startDate, setPagination]);

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
      <LogsDataGridCard>
        <LogsToolbar pathOptions={pathOptions} statusOptions={statusOptions} />
      </LogsDataGridCard>
    </DataGrid>
  );
}
