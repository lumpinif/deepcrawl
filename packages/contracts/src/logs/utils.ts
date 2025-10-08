import {
  DEFAULT_GET_MANY_LOGS_OPTIONS,
  GET_MANY_LOGS_DEFAULT_LIMIT,
  GET_MANY_LOGS_DEFAULT_OFFSET,
  GET_MANY_LOGS_DEFAULT_SORT_COLUMN,
  GET_MANY_LOGS_DEFAULT_SORT_DIRECTION,
  GET_MANY_LOGS_DEFAULT_WINDOW_IN_DAYS,
  GET_MANY_LOGS_SORT_COLUMNS,
  GET_MANY_LOGS_SORT_DIRECTIONS,
} from '@deepcrawl/types/configs/default';
import type {
  GetManyLogsSortColumn,
  GetManyLogsSortDirection,
} from '@deepcrawl/types/routers/logs';

import type { GetManyLogsOptions } from './index';

const SORT_COLUMN_SET = new Set<GetManyLogsSortColumn>(
  GET_MANY_LOGS_SORT_COLUMNS,
);

const SORT_DIRECTION_SET = new Set<GetManyLogsSortDirection>(
  GET_MANY_LOGS_SORT_DIRECTIONS,
);

export function toISOStringBoundary(
  date: Date,
  boundary: 'start' | 'end',
): string {
  const normalized = new Date(date);
  if (boundary === 'start') {
    normalized.setUTCHours(0, 0, 0, 0);
  } else {
    normalized.setUTCHours(23, 59, 59, 999);
  }
  return normalized.toISOString();
}

export function createDefaultLogsDateRange(
  referenceDate: Date,
  windowInDays: number,
): { startDate: string; endDate: string } {
  const endBoundary = toISOStringBoundary(referenceDate, 'end');
  const startReference = new Date(referenceDate);
  startReference.setUTCDate(startReference.getUTCDate() - (windowInDays - 1));
  const startBoundary = toISOStringBoundary(startReference, 'start');

  return {
    startDate: startBoundary,
    endDate: endBoundary,
  };
}

export type GetManyLogsOptionsOverrides = Partial<GetManyLogsOptions>;

export function resolveGetManyLogsOptions(
  overrides: GetManyLogsOptionsOverrides = {},
  referenceDate: Date = new Date(),
): GetManyLogsOptions {
  const { limit, offset, startDate, endDate, orderBy, orderDir, ...rest } =
    overrides;

  const defaultRange = createDefaultLogsDateRange(
    referenceDate,
    GET_MANY_LOGS_DEFAULT_WINDOW_IN_DAYS,
  );

  const resolvedLimit =
    typeof limit === 'number' && Number.isFinite(limit)
      ? limit
      : GET_MANY_LOGS_DEFAULT_LIMIT;
  const resolvedOffset =
    typeof offset === 'number' && Number.isFinite(offset)
      ? offset
      : GET_MANY_LOGS_DEFAULT_OFFSET;

  return {
    ...DEFAULT_GET_MANY_LOGS_OPTIONS,
    ...rest,
    limit: resolvedLimit,
    offset: resolvedOffset,
    startDate:
      typeof startDate === 'string' ? startDate : defaultRange.startDate,
    endDate: typeof endDate === 'string' ? endDate : defaultRange.endDate,
    orderBy:
      typeof orderBy === 'string' &&
      SORT_COLUMN_SET.has(orderBy as GetManyLogsSortColumn)
        ? (orderBy as GetManyLogsSortColumn)
        : GET_MANY_LOGS_DEFAULT_SORT_COLUMN,
    orderDir:
      typeof orderDir === 'string' &&
      SORT_DIRECTION_SET.has(orderDir as GetManyLogsSortDirection)
        ? (orderDir as GetManyLogsSortDirection)
        : GET_MANY_LOGS_DEFAULT_SORT_DIRECTION,
  } satisfies GetManyLogsOptions;
}
