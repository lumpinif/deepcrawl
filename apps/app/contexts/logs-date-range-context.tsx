'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { DEFAULT_LOGS_DATE_RANGE_PRESET } from '@/lib/logs/config';
import type { LogsDateRange } from '@/lib/logs/types';
import { createLogsDateRangeFromPreset } from '@/utils/logs';

export interface LogsDateRangeContextValue {
  /**
   * Current active date range - single source of truth
   * This is what gets used by useLogsData
   */
  activeRange: LogsDateRange;
  /**
   * Update the active date range
   */
  setActiveRange: (range: LogsDateRange) => void;
}

const LogsDateRangeContext = createContext<
  LogsDateRangeContextValue | undefined
>(undefined);

interface LogsDateRangeProviderProps {
  children: React.ReactNode;
  initialDateRange?: LogsDateRange;
}

export function LogsDateRangeProvider({
  children,
  initialDateRange,
}: LogsDateRangeProviderProps) {
  const [activeRange, setActiveRange] = useState<LogsDateRange>(() => {
    if (initialDateRange) {
      return initialDateRange;
    }
    return createLogsDateRangeFromPreset(DEFAULT_LOGS_DATE_RANGE_PRESET);
  });

  const updateActiveRange = useCallback((range: LogsDateRange) => {
    setActiveRange(range);
  }, []);

  return (
    <LogsDateRangeContext.Provider
      value={{
        activeRange,
        setActiveRange: updateActiveRange,
      }}
    >
      {children}
    </LogsDateRangeContext.Provider>
  );
}

export function useLogsDateRangeContext() {
  const context = useContext(LogsDateRangeContext);
  if (!context) {
    throw new Error(
      'useLogsDateRangeContext must be used within LogsDateRangeProvider',
    );
  }
  return context;
}
