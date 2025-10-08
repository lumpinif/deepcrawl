import {
  createDefaultLogsDateRange,
  type GetManyLogsOptions,
  resolveGetManyLogsOptions,
  toISOStringBoundary,
} from '@deepcrawl/contracts/logs';
import {
  GetManyLogsOptionsSchema,
  normalizeGetManyLogsPagination,
} from '@deepcrawl/types/routers/logs';
import type { z } from 'zod/v4';
import {
  DEFAULT_LOGS_DATE_RANGE_PRESET,
  LOGS_DATE_RANGE_PRESET_IN_DAYS,
  type LogsDateRangePreset,
} from '@/lib/logs/config';
import type { LogsDateRange } from '@/lib/logs/types';

export function createDefaultGetManyLogsOptions(
  referenceDate: Date = new Date(),
): GetManyLogsOptions {
  return resolveGetManyLogsOptions(undefined, referenceDate);
}

type SearchParamsRecord = Readonly<
  Record<string, string | string[] | null | undefined>
>;

export type GetManyLogsSearchParamsLike = URLSearchParams | SearchParamsRecord;

function getFirstValue(
  source: GetManyLogsSearchParamsLike,
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
  source: GetManyLogsSearchParamsLike,
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
  source: GetManyLogsSearchParamsLike,
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

export type ParseGetManyLogsSearchParamsSuccess = {
  readonly success: true;
  readonly options: GetManyLogsOptions;
  readonly raw: z.infer<typeof GetManyLogsOptionsSchema>;
};

export type ParseGetManyLogsSearchParamsFailure = {
  readonly success: false;
  readonly error: z.ZodError;
};

export type ParseGetManyLogsSearchParamsResult =
  | ParseGetManyLogsSearchParamsSuccess
  | ParseGetManyLogsSearchParamsFailure;

export function parseGetManyLogsSearchParams(
  source: GetManyLogsSearchParamsLike,
  referenceDate: Date = new Date(),
): ParseGetManyLogsSearchParamsResult {
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

  const validation = GetManyLogsOptionsSchema.safeParse(raw);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
    };
  }

  const options = resolveGetManyLogsOptions(validation.data, referenceDate);
  return {
    success: true,
    options,
    raw: validation.data,
  };
}

export function serializeGetManyLogsOptions(
  options: GetManyLogsOptions,
): URLSearchParams {
  const searchParams = new URLSearchParams();
  const { limit, offset } = normalizeGetManyLogsPagination(options);

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
