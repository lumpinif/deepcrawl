import type { GetManyLogsOptions } from '@deepcrawl/contracts';
import { DEFAULT_GET_MANY_LOGS_OPTIONS } from '@deepcrawl/contracts';

const LOGS_DATE_RANGE_PRESET_IN_DAYS = {
  'last-2-days': 2,
  'last-7-days': 7,
  'last-30-days': 30,
  'last-90-days': 90,
} as const;

export type LogsDateRangePreset = keyof typeof LOGS_DATE_RANGE_PRESET_IN_DAYS;

export const DEFAULT_LOGS_DATE_RANGE_PRESET: LogsDateRangePreset =
  'last-7-days';

export interface LogsDateRange {
  readonly startDate: string;
  readonly endDate: string;
}

function toISOStringBoundary(date: Date, boundary: 'start' | 'end'): string {
  const normalized = new Date(date);
  if (boundary === 'start') {
    normalized.setHours(0, 0, 0, 0);
  } else {
    normalized.setHours(23, 59, 59, 999);
  }
  return normalized.toISOString();
}

export function createLogsDateRangeFromPreset(
  preset: LogsDateRangePreset,
  referenceDate = new Date(),
): LogsDateRange {
  const days = LOGS_DATE_RANGE_PRESET_IN_DAYS[preset];
  const endDate = toISOStringBoundary(referenceDate, 'end');

  const startReference = new Date(referenceDate);
  startReference.setDate(startReference.getDate() - (days - 1));
  const startDate = toISOStringBoundary(startReference, 'start');

  return { startDate, endDate } satisfies LogsDateRange;
}

export function createLogsDateRangeFromDates(
  from: Date,
  to: Date,
): LogsDateRange {
  const [start, end] = from <= to ? [from, to] : [to, from];
  return {
    startDate: toISOStringBoundary(start, 'start'),
    endDate: toISOStringBoundary(end, 'end'),
  } satisfies LogsDateRange;
}

export function createDefaultGetManyLogsQueryParams(
  referenceDate = new Date(),
): GetManyLogsOptions {
  const { startDate, endDate } = createLogsDateRangeFromPreset(
    DEFAULT_LOGS_DATE_RANGE_PRESET,
    referenceDate,
  );

  return {
    ...DEFAULT_GET_MANY_LOGS_OPTIONS,
    startDate,
    endDate,
  } satisfies GetManyLogsOptions;
}

/**
 * @deprecated Prefer calling {@link createDefaultGetManyLogsQueryParams} to
 * ensure the date range is generated per request.
 */
export const DEFAULT_GET_MANY_LOGS_QUERY_PARAMS: GetManyLogsOptions =
  createDefaultGetManyLogsQueryParams();

export const LOGS_DATE_RANGE_PRESETS =
  LOGS_DATE_RANGE_PRESET_IN_DAYS;
