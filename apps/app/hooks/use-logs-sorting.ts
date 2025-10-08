import {
  GET_MANY_LOGS_DEFAULT_SORT_COLUMN,
  GET_MANY_LOGS_DEFAULT_SORT_DIRECTION,
} from '@deepcrawl/types/configs/default';
import type {
  GetManyLogsSortColumn,
  GetManyLogsSortDirection,
} from '@deepcrawl/types/routers/logs';
import type { SortingState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

const COLUMN_TO_SORT_COLUMN: Record<string, GetManyLogsSortColumn> = {
  timestamp: 'requestTimestamp',
  path: 'path',
  url: 'requestUrl',
  status: 'success',
};

const INITIAL_SORTING: SortingState = [{ id: 'timestamp', desc: true }];

export interface UseLogsSortingReturn {
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  orderBy: GetManyLogsSortColumn;
  orderDir: GetManyLogsSortDirection;
}

export function useLogsSorting(): UseLogsSortingReturn {
  const [sorting, setSorting] = useState<SortingState>(INITIAL_SORTING);

  const { orderBy, orderDir } = useMemo(() => {
    const [primary] = sorting;
    if (!primary) {
      return {
        orderBy: GET_MANY_LOGS_DEFAULT_SORT_COLUMN,
        orderDir: GET_MANY_LOGS_DEFAULT_SORT_DIRECTION,
      };
    }

    const mapped =
      COLUMN_TO_SORT_COLUMN[primary.id] ?? GET_MANY_LOGS_DEFAULT_SORT_COLUMN;
    const direction: GetManyLogsSortDirection =
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
