import {
  createDefaultLogsDateRange,
  type ListLogsOptions,
  resolveListLogsOptions,
  toISOStringBoundary,
} from '@deepcrawl/contracts/logs';
import { ListLogsOptionsSchema } from 'deepcrawl/schemas';
import { normalizeListLogsPagination } from 'deepcrawl/types/utils';
import type { z } from 'zod/v4';
import {
  DEFAULT_LOGS_DATE_RANGE_PRESET,
  LOGS_DATE_RANGE_PRESET_IN_DAYS,
  type LogsDateRangePreset,
} from '@/lib/logs/config';
import type { LogsDateRange } from '@/lib/logs/types';

export function createDefaultListLogsOptions(
  referenceDate: Date = new Date(),
): ListLogsOptions {
  return resolveListLogsOptions(undefined, referenceDate);
}

type SearchParamsRecord = Readonly<
  Record<string, string | string[] | null | undefined>
>;

export type ListLogsSearchParamsLike = URLSearchParams | SearchParamsRecord;

function getFirstValue(
  source: ListLogsSearchParamsLike,
  key: string,
): string | undefined {
  if (source instanceof URLSearchParams) {
    const value = source.get(key);
    return value ?? undefined;
  }

  const raw = source[key];
  if (Array.isArray(raw)) {
    return raw[0] ?? undefined;
  }
  return raw ?? undefined;
}

function parseNumberParam(
  source: ListLogsSearchParamsLike,
  key: string,
): number | undefined {
  const value = getFirstValue(source, key);
  if (value === undefined) {
    return;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function parseBooleanParam(
  source: ListLogsSearchParamsLike,
  key: string,
): boolean | undefined {
  const value = getFirstValue(source, key);
  if (value === undefined) {
    return;
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return;
}

export type ParseListLogsSearchParamsSuccess = {
  readonly success: true;
  readonly options: ListLogsOptions;
  readonly raw: z.infer<typeof ListLogsOptionsSchema>;
};

export type ParseListLogsSearchParamsFailure = {
  readonly success: false;
  readonly error: z.ZodError;
};

export type ParseListLogsSearchParamsResult =
  | ParseListLogsSearchParamsSuccess
  | ParseListLogsSearchParamsFailure;

export function parseListLogsSearchParams(
  source: ListLogsSearchParamsLike,
  referenceDate: Date = new Date(),
): ParseListLogsSearchParamsResult {
  const raw = {
    limit: parseNumberParam(source, 'limit'),
    offset: parseNumberParam(source, 'offset'),
    path: getFirstValue(source, 'path'),
    success: parseBooleanParam(source, 'success'),
    startDate: getFirstValue(source, 'startDate'),
    endDate: getFirstValue(source, 'endDate'),
    orderBy: getFirstValue(source, 'orderBy'),
    orderDir: getFirstValue(source, 'orderDir'),
  };

  const validation = ListLogsOptionsSchema.safeParse(raw);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
    };
  }

  const options = resolveListLogsOptions(validation.data, referenceDate);
  return {
    success: true,
    options,
    raw: validation.data,
  };
}

export function serializeListLogsOptions(
  options: ListLogsOptions,
): URLSearchParams {
  const searchParams = new URLSearchParams();
  const { limit, offset } = normalizeListLogsPagination(options);

  if (limit !== undefined) {
    searchParams.set('limit', limit.toString());
  }

  if (offset !== undefined) {
    searchParams.set('offset', offset.toString());
  }

  if (options.path) {
    searchParams.set('path', options.path);
  }

  if (options.success !== undefined) {
    searchParams.set('success', String(options.success));
  }

  if (options.startDate) {
    searchParams.set('startDate', options.startDate);
  }

  if (options.endDate) {
    searchParams.set('endDate', options.endDate);
  }

  if (options.orderBy) {
    searchParams.set('orderBy', options.orderBy);
  }

  if (options.orderDir) {
    searchParams.set('orderDir', options.orderDir);
  }

  return searchParams;
}

export function createLogsDateRangeFromPreset(
  preset: LogsDateRangePreset,
  referenceDate = new Date(),
): LogsDateRange {
  const resolvedPreset =
    LOGS_DATE_RANGE_PRESET_IN_DAYS[preset] !== undefined
      ? preset
      : DEFAULT_LOGS_DATE_RANGE_PRESET;
  const days = LOGS_DATE_RANGE_PRESET_IN_DAYS[resolvedPreset];
  return createDefaultLogsDateRange(referenceDate, days);
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
