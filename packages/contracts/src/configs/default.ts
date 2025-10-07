import type { GetManyLogsOptions } from '../logs';

export const GET_MANY_LOGS_DEFAULT_LIMIT = 10;
export const GET_MANY_LOGS_DEFAULT_OFFSET = 0;

export const DEFAULT_GET_MANY_LOGS_OPTIONS: Readonly<
  Pick<GetManyLogsOptions, 'limit' | 'offset'>
> = Object.freeze({
  limit: GET_MANY_LOGS_DEFAULT_LIMIT,
  offset: GET_MANY_LOGS_DEFAULT_OFFSET,
});

export type GetManyLogsOptionsOverrides = Partial<GetManyLogsOptions>;

export function resolveGetManyLogsOptions(
  overrides: GetManyLogsOptionsOverrides = {},
): GetManyLogsOptions {
  const { limit, offset, ...rest } = overrides;

  return {
    ...DEFAULT_GET_MANY_LOGS_OPTIONS,
    ...rest,
    limit:
      typeof limit === 'number' && Number.isFinite(limit)
        ? limit
        : GET_MANY_LOGS_DEFAULT_LIMIT,
    offset:
      typeof offset === 'number' && Number.isFinite(offset)
        ? offset
        : GET_MANY_LOGS_DEFAULT_OFFSET,
  } satisfies GetManyLogsOptions;
}
