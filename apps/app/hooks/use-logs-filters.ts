import { useLogsFiltersContext } from '@/contexts/logs-filters-context';

export type {
  LogsFiltersContextValue as UseLogsFiltersReturn,
  LogsFiltersState,
} from '@/contexts/logs-filters-context';

/**
 * Hook to access shared logs filters state from context
 * @returns Logs filters state and actions
 * @throws Error if used outside LogsFiltersProvider
 */
export function useLogsFilters() {
  return useLogsFiltersContext();
}
