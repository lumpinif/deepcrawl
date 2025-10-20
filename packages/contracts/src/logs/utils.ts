import {
  DEFAULT_LIST_LOGS_OPTIONS,
  LIST_LOGS_DEFAULT_LIMIT,
  LIST_LOGS_DEFAULT_OFFSET,
  LIST_LOGS_DEFAULT_SORT_COLUMN,
  LIST_LOGS_DEFAULT_SORT_DIRECTION,
  LIST_LOGS_DEFAULT_WINDOW_IN_DAYS,
  LIST_LOGS_SORT_COLUMNS,
  LIST_LOGS_SORT_DIRECTIONS,
} from '@deepcrawl/types/configs/default';
import type {
  ListLogsSortColumn,
  ListLogsSortDirection,
} from '@deepcrawl/types/routers/logs';

import type { ListLogsOptions } from './index';

const SORT_COLUMN_SET = new Set<ListLogsSortColumn>(LIST_LOGS_SORT_COLUMNS);

const SORT_DIRECTION_SET = new Set<ListLogsSortDirection>(
  LIST_LOGS_SORT_DIRECTIONS,
);

export function toISOStringBoundary(
  date: Date,
  boundary: 'start' | 'end',
): string {
  const normalized = new Date(date);
  if (boundary === 'start') {
    // Set to start of day in LOCAL timezone, then convert to UTC
    normalized.setHours(0, 0, 0, 0);
  } else {
    // Set to end of day in LOCAL timezone, then convert to UTC
    normalized.setHours(23, 59, 59, 999);
  }
  return normalized.toISOString();
}

export function createDefaultLogsDateRange(
  referenceDate: Date,
  windowInDays: number,
): { startDate: string; endDate: string } {
  const endBoundary = toISOStringBoundary(referenceDate, 'end');
  const startReference = new Date(referenceDate);
  // Subtract days in LOCAL timezone, not UTC
  startReference.setDate(startReference.getDate() - (windowInDays - 1));
  const startBoundary = toISOStringBoundary(startReference, 'start');

  return {
    startDate: startBoundary,
    endDate: endBoundary,
  };
}

export type ListLogsOptionsOverrides = Partial<ListLogsOptions>;

export function resolveListLogsOptions(
  overrides: ListLogsOptionsOverrides = {},
  referenceDate: Date = new Date(),
): ListLogsOptions {
  const { limit, offset, startDate, endDate, orderBy, orderDir, ...rest } =
    overrides;

  const defaultRange = createDefaultLogsDateRange(
    referenceDate,
    LIST_LOGS_DEFAULT_WINDOW_IN_DAYS,
  );

  const resolvedLimit =
    typeof limit === 'number' && Number.isFinite(limit)
      ? limit
      : LIST_LOGS_DEFAULT_LIMIT;
  const resolvedOffset =
    typeof offset === 'number' && Number.isFinite(offset)
      ? offset
      : LIST_LOGS_DEFAULT_OFFSET;

  return {
    ...DEFAULT_LIST_LOGS_OPTIONS,
    ...rest,
    limit: resolvedLimit,
    offset: resolvedOffset,
    startDate:
      typeof startDate === 'string' ? startDate : defaultRange.startDate,
    endDate: typeof endDate === 'string' ? endDate : defaultRange.endDate,
    orderBy:
      typeof orderBy === 'string' &&
      SORT_COLUMN_SET.has(orderBy as ListLogsSortColumn)
        ? (orderBy as ListLogsSortColumn)
        : LIST_LOGS_DEFAULT_SORT_COLUMN,
    orderDir:
      typeof orderDir === 'string' &&
      SORT_DIRECTION_SET.has(orderDir as ListLogsSortDirection)
        ? (orderDir as ListLogsSortDirection)
        : LIST_LOGS_DEFAULT_SORT_DIRECTION,
  } satisfies ListLogsOptions;
}
