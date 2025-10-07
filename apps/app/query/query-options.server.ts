import type { GetManyLogsOptions } from '@deepcrawl/contracts/logs';
import { queryOptions } from '@tanstack/react-query';
import {
  authGetFullOrganization,
  authGetSession,
  authListApiKeys,
  authListDeviceSessions,
  authListPasskeys,
  authListSessions,
  authListUserAccounts,
} from '@/query/auth-query.server';
import { dcGetManyLogs } from './logs-query.server';
import { DEFAULT_GET_MANY_LOGS_QUERY_PARAMS } from './logs-query.shared';
import { baseQueryOptions } from './query.client';
import { userQueryKeys } from './query-keys';

/** @server
 * Query options for the current authenticated session
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: userQueryKeys.session,
    queryFn: authGetSession,
    ...baseQueryOptions,
  });

/**@server
 * Query options for active sessions list
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const listSessionsQueryOptions = () =>
  queryOptions({
    queryKey: userQueryKeys.listSessions,
    queryFn: authListSessions,
    ...baseQueryOptions,
  });

/**@server
 * Query options for device sessions
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const deviceSessionsQueryOptions = () =>
  queryOptions({
    queryKey: userQueryKeys.deviceSessions,
    queryFn: authListDeviceSessions,
    ...baseQueryOptions,
  });

/**@server
 * Query options for organization data
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const organizationQueryOptions = () =>
  queryOptions({
    queryKey: userQueryKeys.organization,
    queryFn: authGetFullOrganization,
    ...baseQueryOptions,
  });

/**@server
 * Query options for user passkeys
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const authPasskeysQueryOptions = () =>
  queryOptions({
    queryKey: userQueryKeys.passkeys,
    queryFn: authListPasskeys,
    ...baseQueryOptions,
  });

/**@server
 * Query options for user's linked OAuth accounts
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const authListUserAccountsQueryOptions = () =>
  queryOptions({
    queryKey: userQueryKeys.listUserAccounts,
    queryFn: authListUserAccounts,
    ...baseQueryOptions,
  });

/**@server
 * Query options for user's API keys
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const apiKeysQueryOptions = () =>
  queryOptions({
    queryKey: userQueryKeys.apiKeys,
    queryFn: authListApiKeys,
    ...baseQueryOptions,
  });

/**@server
 * Query options for activity logs
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const getManyLogsQueryOptions = (
  params: GetManyLogsOptions = DEFAULT_GET_MANY_LOGS_QUERY_PARAMS,
) =>
  queryOptions({
    queryKey: [...userQueryKeys.activityLogs, params],
    queryFn: () => dcGetManyLogs(params),
    ...baseQueryOptions,
  });
