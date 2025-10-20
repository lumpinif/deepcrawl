import {
  LIST_LOGS_DEFAULT_SORT_COLUMN,
  LIST_LOGS_DEFAULT_SORT_DIRECTION,
} from '@deepcrawl/types/configs/default';
import type { SortingState } from '@tanstack/react-table';
import type {
  ListLogsSortColumn,
  ListLogsSortDirection,
} from 'deepcrawl/types';
import { useMemo, useState } from 'react';

const COLUMN_TO_SORT_COLUMN: Record<string, ListLogsSortColumn> = {
  timestamp: 'requestTimestamp',
  path: 'path',
  url: 'requestUrl',
  status: 'success',
};

const INITIAL_SORTING: SortingState = [{ id: 'timestamp', desc: true }];

export interface UseLogsSortingReturn {
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  orderBy: ListLogsSortColumn;
  orderDir: ListLogsSortDirection;
}

export function useLogsSorting(): UseLogsSortingReturn {
  const [sorting, setSorting] = useState<SortingState>(INITIAL_SORTING);

  const { orderBy, orderDir } = useMemo(() => {
    const [primary] = sorting;
    if (!primary) {
      return {
        orderBy: LIST_LOGS_DEFAULT_SORT_COLUMN,
        orderDir: LIST_LOGS_DEFAULT_SORT_DIRECTION,
      };
    }

    const mapped =
      COLUMN_TO_SORT_COLUMN[primary.id] ?? LIST_LOGS_DEFAULT_SORT_COLUMN;
    const direction: ListLogsSortDirection =
      primary.desc === false ? 'asc' : 'desc';

    return {
      orderBy: mapped,
      orderDir: direction,
    };
  }, [sorting]);

  return {
    sorting,
    setSorting,
    orderBy,
    orderDir,
  };
}
