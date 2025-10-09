'use client';

import { DataGrid } from '@deepcrawl/ui/components/reui/data-grid';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@deepcrawl/ui/components/ui/responsive-dialog';
import { useEffect, useRef, useState } from 'react';
import { useLogsData } from '@/hooks/use-logs-data';
import { useLogsDateRange } from '@/hooks/use-logs-date-range';
import { useLogsFilters } from '@/hooks/use-logs-filters';
import { useLogsPagination } from '@/hooks/use-logs-pagination';
import { useLogsSorting } from '@/hooks/use-logs-sorting';
import { useLogsTable } from '@/hooks/use-logs-table';
import {
  type ActivityLogEntry,
  formatTimestamp,
  getLogStatus,
  getLogTimestamp,
} from './logs-columns';
import { LogsDataGridCard } from './logs-data-grid-card';
import { LogsDetailContent } from './logs-detail-content';
import { LogsToolbar } from './logs-toolbar';
// import { LogsChart } from './logs-chart';

export default function ActivityLogsDataGrid() {
  const [selectedLog, setSelectedLog] = useState<ActivityLogEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleRowClick = (row: ActivityLogEntry) => {
    setSelectedLog(row);
    setDialogOpen(true);
  };

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
    <>
      <DataGrid
        loadingMessage="Loading activity logs..."
        onRowClick={handleRowClick}
        recordCount={recordCount}
        table={table}
        tableLayout={{
          columnsPinnable: true,
          columnsResizable: true,
          columnsMovable: true,
          columnsVisibility: true,
        }}
      >
        {/* <div className="flex w-full flex-col items-center justify-between gap-2 sm:flex-row">
        <LogsChart />
      </div> */}
        <LogsDataGridCard>
          <LogsToolbar
            pathOptions={pathOptions}
            statusOptions={statusOptions}
          />
        </LogsDataGridCard>
      </DataGrid>
      <ResponsiveDialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <ResponsiveDialogContent className="max-md:px-8 md:max-w-2xl xl:max-w-4xl">
          <ResponsiveDialogHeader>
            <div className="flex flex-col-reverse items-center justify-between gap-x-2 gap-y-2 md:flex-row md:pr-4">
              <ResponsiveDialogTitle>
                Activity Log Details
              </ResponsiveDialogTitle>
              <div className="flex items-center gap-x-1">
                {selectedLog && (
                  <Badge
                    className="bg-card font-medium text-sm capitalize"
                    variant="outline"
                  >
                    {selectedLog.path}
                  </Badge>
                )}

                {selectedLog && (
                  <Badge
                    className="bg-card font-medium text-sm capitalize"
                    variant={
                      getLogStatus(selectedLog) === 'success'
                        ? 'outline'
                        : 'destructive'
                    }
                  >
                    {getLogStatus(selectedLog)}
                  </Badge>
                )}
              </div>
            </div>
            <ResponsiveDialogDescription>
              View detailed information about this activity log entry.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          {selectedLog && <LogsDetailContent log={selectedLog} />}
          <ResponsiveDialogFooter>
            <Button onClick={() => setDialogOpen(false)} variant="outline">
              Close
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}
