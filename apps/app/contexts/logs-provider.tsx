'use client';

import { LogsDateRangeProvider } from './logs-date-range-context';
import { LogsFiltersProvider } from './logs-filters-context';

interface LogsProviderProps {
  children: React.ReactNode;
}

/**
 * Combined provider for all logs-related contexts
 * Wraps LogsDateRangeProvider and LogsFiltersProvider
 */
export function LogsProvider({ children }: LogsProviderProps) {
  return (
    <LogsDateRangeProvider>
      <LogsFiltersProvider>{children}</LogsFiltersProvider>
    </LogsDateRangeProvider>
  );
}
