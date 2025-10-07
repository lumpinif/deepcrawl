import type { GetManyLogsOptions } from '@deepcrawl/contracts/logs';
import { useSuspenseQuery } from '@tanstack/react-query';
import { DEFAULT_GET_MANY_LOGS_QUERY_PARAMS } from '@/query/logs-query.shared';
import { getManyLogsQueryOptionsClient } from '@/query/query-options.client';

/**
 * Suspense-friendly
 */
export const useSuspenseGetManyLogs = (params?: GetManyLogsOptions) =>
  useSuspenseQuery(
    getManyLogsQueryOptionsClient(params ?? DEFAULT_GET_MANY_LOGS_QUERY_PARAMS),
  );
