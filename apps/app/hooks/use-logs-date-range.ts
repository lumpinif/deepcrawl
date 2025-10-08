import { useLogsDateRangeContext } from '@/contexts/logs-date-range-context';

export type { LogsDateRangeContextValue as UseLogsDateRangeReturn } from '@/contexts/logs-date-range-context';

/**
 * Hook to access shared logs date range state from context
 * @returns Logs date range state and actions
 * @throws Error if used outside LogsDateRangeProvider
 */
export function useLogsDateRange() {
  return useLogsDateRangeContext();
}
