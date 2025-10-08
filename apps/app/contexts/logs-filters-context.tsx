'use client';

import { createContext, useCallback, useContext, useState } from 'react';

export interface LogsFiltersState {
  searchQuery: string;
  selectedStatuses: string[];
  selectedPaths: string[];
}

export interface LogsFiltersContextValue extends LogsFiltersState {
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  toggleStatus: (status: string, checked: boolean) => void;
  togglePath: (path: string, checked: boolean) => void;
  resetFilters: () => void;
}

const LogsFiltersContext = createContext<LogsFiltersContextValue | undefined>(
  undefined,
);

interface LogsFiltersProviderProps {
  children: React.ReactNode;
}

export function LogsFiltersProvider({ children }: LogsFiltersProviderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const toggleStatus = useCallback((status: string, checked: boolean) => {
    setSelectedStatuses((previous = []) => {
      if (checked) {
        return previous.includes(status) ? previous : [...previous, status];
      }
      return previous.filter((candidate) => candidate !== status);
    });
  }, []);

  const togglePath = useCallback((path: string, checked: boolean) => {
    setSelectedPaths((previous = []) => {
      if (checked) {
        return previous.includes(path) ? previous : [...previous, path];
      }
      return previous.filter((candidate) => candidate !== path);
    });
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedStatuses([]);
    setSelectedPaths([]);
  }, []);

  return (
    <LogsFiltersContext.Provider
      value={{
        searchQuery,
        selectedStatuses,
        selectedPaths,
        setSearchQuery,
        clearSearch,
        toggleStatus,
        togglePath,
        resetFilters,
      }}
    >
      {children}
    </LogsFiltersContext.Provider>
  );
}

export function useLogsFiltersContext() {
  const context = useContext(LogsFiltersContext);
  if (!context) {
    throw new Error(
      'useLogsFiltersContext must be used within LogsFiltersProvider',
    );
  }
  return context;
}
