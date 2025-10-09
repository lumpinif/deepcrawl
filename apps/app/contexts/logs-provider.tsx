'use client';

import type { LogsDateRange } from '@/lib/logs/types';
import { LogsDateRangeProvider } from './logs-date-range-context';
import { LogsFiltersProvider } from './logs-filters-context';

interface LogsProviderProps {
  children: React.ReactNode;
  initialDateRange?: LogsDateRange;
}

/**
 * Combined provider for all logs-related contexts
 * Wraps LogsDateRangeProvider and LogsFiltersProvider
 */
export function LogsProvider({
  children,
  initialDateRange,
}: LogsProviderProps) {
  return (
    <LogsDateRangeProvider initialDateRange={initialDateRange}>
      <LogsFiltersProvider>{children}</LogsFiltersProvider>
    </LogsDateRangeProvider>
  );
}
