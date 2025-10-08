import {
  GET_MANY_LOGS_DEFAULT_LIMIT,
  GET_MANY_LOGS_DEFAULT_OFFSET,
} from '@deepcrawl/types/configs/default';
import type { PaginationState } from '@tanstack/react-table';
import { useCallback, useState } from 'react';

export interface UseLogsPaginationReturn {
  pagination: PaginationState;
  setPagination: (
    updater: PaginationState | ((previous: PaginationState) => PaginationState),
  ) => void;
  resetPagination: () => void;
}

const INITIAL_PAGINATION: PaginationState = {
  pageIndex: GET_MANY_LOGS_DEFAULT_OFFSET,
  pageSize: GET_MANY_LOGS_DEFAULT_LIMIT,
};

export function useLogsPagination(): UseLogsPaginationReturn {
  const [pagination, setPaginationState] =
    useState<PaginationState>(INITIAL_PAGINATION);

  const setPagination = useCallback(
    (
      updater:
        | PaginationState
        | ((previous: PaginationState) => PaginationState),
    ) => {
      setPaginationState((previous) => {
        const nextState =
          typeof updater === 'function'
            ? (updater as (prev: PaginationState) => PaginationState)(previous)
            : updater;
        return nextState;
      });
    },
    [],
  );

  const resetPagination = useCallback(() => {
    setPaginationState(INITIAL_PAGINATION);
  }, []);

  return {
    pagination,
    setPagination,
    resetPagination,
  };
}
