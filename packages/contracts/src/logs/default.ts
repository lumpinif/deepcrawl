import {
  type GetManyLogsSortColumn,
  GetManyLogsSortColumnSchema,
  type GetManyLogsSortDirection,
  GetManyLogsSortDirectionSchema,
} from '@deepcrawl/types/routers/logs';
import type { GetManyLogsOptions } from '../logs';

export const GET_MANY_LOGS_DEFAULT_LIMIT = 10;
export const GET_MANY_LOGS_DEFAULT_OFFSET = 0;
export const GET_MANY_LOGS_DEFAULT_WINDOW_IN_DAYS = 2;

export const GET_MANY_LOGS_SORT_COLUMNS = Object.freeze([
  ...GetManyLogsSortColumnSchema.options,
] as readonly GetManyLogsSortColumn[]);

export const GET_MANY_LOGS_SORT_DIRECTIONS = Object.freeze([
  ...GetManyLogsSortDirectionSchema.options,
] as readonly GetManyLogsSortDirection[]);

export const GET_MANY_LOGS_DEFAULT_SORT_COLUMN: GetManyLogsSortColumn =
  GET_MANY_LOGS_SORT_COLUMNS.find((value) => value === 'requestTimestamp') ??
  'requestTimestamp';

export const GET_MANY_LOGS_DEFAULT_SORT_DIRECTION: GetManyLogsSortDirection =
  GET_MANY_LOGS_SORT_DIRECTIONS.find((value) => value === 'desc') ?? 'desc';

export const DEFAULT_GET_MANY_LOGS_OPTIONS: Readonly<
  Pick<GetManyLogsOptions, 'limit' | 'offset' | 'orderBy' | 'orderDir'>
> = Object.freeze({
  limit: GET_MANY_LOGS_DEFAULT_LIMIT,
  offset: GET_MANY_LOGS_DEFAULT_OFFSET,
  orderBy: GET_MANY_LOGS_DEFAULT_SORT_COLUMN,
  orderDir: GET_MANY_LOGS_DEFAULT_SORT_DIRECTION,
});
