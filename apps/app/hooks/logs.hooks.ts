import type { ListLogsOptions } from '@deepcrawl/contracts/logs';
import { useSuspenseQuery } from '@tanstack/react-query';
import { listLogsQueryOptionsClient } from '@/query/query-options.client';

/**
 * Suspense-friendly
 */
export const useSuspenseListLogs = (params: ListLogsOptions) =>
  useSuspenseQuery(listLogsQueryOptionsClient(params));
