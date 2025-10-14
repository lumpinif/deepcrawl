import { resolveGetManyLogsOptions } from '@deepcrawl/contracts';
import type {
  ActivityLogEntry,
  GetManyLogsResponseMeta,
  GetManyLogsSortColumn,
  GetManyLogsSortDirection,
} from 'deepcrawl/types';
import { useMemo } from 'react';
import { getLogStatus } from '@/components/logs/logs-columns';
import type { FilterOption } from '@/components/logs/logs-filter-popover';
import { useSuspenseGetManyLogs } from '@/hooks/logs.hooks';
import type { LogsDateRange } from '@/lib/logs/types';

export interface UseLogsDataOptions {
  dateRange: LogsDateRange;
  limit: number;
  offset: number;
  orderBy: GetManyLogsSortColumn;
  orderDir: GetManyLogsSortDirection;
  searchQuery: string;
  selectedStatuses: string[];
  selectedPaths: string[];
}

export interface UseLogsDataReturn {
  logs: ReturnType<typeof useSuspenseGetManyLogs>['data']['logs'];
  filteredLogs: ReturnType<typeof useSuspenseGetManyLogs>['data']['logs'];
  meta: ReturnType<typeof useSuspenseGetManyLogs>['data']['meta'];
  statusOptions: FilterOption[];
  pathOptions: FilterOption[];
  hasNextPage: boolean;
  recordCount: number;
}

export function useLogsData({
  dateRange,
  limit,
  offset,
  orderBy,
  orderDir,
  searchQuery,
  selectedStatuses,
  selectedPaths,
}: UseLogsDataOptions): UseLogsDataReturn {
  const queryOptions = useMemo(
    () =>
      resolveGetManyLogsOptions({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit,
        offset,
        orderBy,
        orderDir,
      }),
    [dateRange.endDate, dateRange.startDate, limit, offset, orderBy, orderDir],
  );

  const { data } = useSuspenseGetManyLogs(queryOptions);

  const logs = data.logs as ActivityLogEntry[];
  const meta = data.meta as GetManyLogsResponseMeta;

  // Apply client-side filters
  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const matchesStatus =
        !selectedStatuses.length ||
        selectedStatuses.includes(getLogStatus(item));
      const matchesPath =
        !selectedPaths.length || selectedPaths.includes(item.path);

      if (!searchQuery) {
        return matchesStatus && matchesPath;
      }

      const searchLower = searchQuery.toLowerCase();

      // Search across all relevant fields
      const searchableFields = [
        item.id,
        item.path,
        item.requestTimestamp,
        item.requestOptions.url,
        String(item.success),
        /* too wide to search */
        // JSON.stringify(requestOptions),
        // JSON.stringify(item.response),
      ];

      const matchesSearch = searchableFields.some((field) =>
        String(field).toLowerCase().includes(searchLower),
      );

      return matchesStatus && matchesPath && matchesSearch;
    });
  }, [logs, searchQuery, selectedPaths, selectedStatuses]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    return logs.reduce(
      (acc, item) => {
        const status = getLogStatus(item);
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [logs]);

  // Calculate path counts
  const pathCounts = useMemo(() => {
    return logs.reduce(
      (acc, item) => {
        acc[item.path] = (acc[item.path] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [logs]);

  // Convert to FilterOption arrays
  const statusOptions = useMemo(
    () =>
      Object.entries(statusCounts).map(([value, count]) => ({
        value,
        count,
      })),
    [statusCounts],
  );

  const pathOptions = useMemo(
    () =>
      Object.entries(pathCounts)
        .sort((first, second) =>
          first[0].localeCompare(second[0], undefined, { sensitivity: 'base' }),
        )
        .map(([value, count]) => ({
          value,
          count,
        })),
    [pathCounts],
  );

  const hasNextPage = meta.hasMore;
  const recordCount =
    meta.offset + filteredLogs.length + (meta.hasMore ? 1 : 0);

  return {
    logs,
    filteredLogs,
    meta,
    statusOptions,
    pathOptions,
    hasNextPage,
    recordCount,
  };
}
