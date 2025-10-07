import type { ListDeviceSessions, Session } from '@deepcrawl/auth/types';
import type { GetManyLogsOptions } from '@deepcrawl/contracts/logs';
import { queryOptions } from '@tanstack/react-query';
import {
  getFullOrganization,
  getSession,
  listAccounts,
  listApiKeys,
  listDeviceSessions,
  listSessions,
  listUserPasskeys,
} from '@/query/auth-query.client';
import { getManyDeepcrawlLogs } from './logs-query.client';
import { DEFAULT_GET_MANY_LOGS_QUERY_PARAMS } from './logs-query.shared';
import { baseQueryOptions } from './query.client';
import { userQueryKeys } from './query-keys';

/** @client
 * Query options for the current authenticated session
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const sessionQueryOptionsClient = ({
  init,
}: {
  init?: Session | null;
} = {}) =>
  queryOptions({
    queryKey: userQueryKeys.session,
    queryFn: getSession,
    initialData: init,
    ...baseQueryOptions,
  });

/**@client
 * Query options for active sessions list
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const listSessionsQueryOptionsClient = () =>
  queryOptions({
    queryKey: userQueryKeys.listSessions,
    queryFn: listSessions,
    ...baseQueryOptions,
  });

/**@client

 * Query options for device sessions
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const deviceSessionsQueryOptionsClient = ({
  init,
}: {
  init?: ListDeviceSessions;
} = {}) =>
  queryOptions({
    queryKey: userQueryKeys.deviceSessions,
    queryFn: listDeviceSessions,
    initialData: init,
    ...baseQueryOptions,
  });

/**@client
 * Query options for organization data
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const organizationQueryOptionsClient = () =>
  queryOptions({
    queryKey: userQueryKeys.organization,
    queryFn: getFullOrganization,
    ...baseQueryOptions,
  });

/**@client

 * Query options for user passkeys
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const userPasskeysQueryOptionsClient = () =>
  queryOptions({
    queryKey: userQueryKeys.passkeys,
    queryFn: listUserPasskeys,
    ...baseQueryOptions,
  });

/**@client

 * Query options for user's linked OAuth accounts
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const listUserAccountsQueryOptionsClient = () =>
  queryOptions({
    queryKey: userQueryKeys.listUserAccounts,
    queryFn: listAccounts,
    ...baseQueryOptions,
  });

/**@client

 * Query options for user's API keys
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const apiKeysQueryOptionsClient = () =>
  queryOptions({
    queryKey: userQueryKeys.apiKeys,
    queryFn: listApiKeys,
    ...baseQueryOptions,
  });

/**@client
 * Query options for activity logs
 * Uses the internal API route so credentials stay server-side
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const getManyLogsQueryOptionsClient = (
  params: GetManyLogsOptions = DEFAULT_GET_MANY_LOGS_QUERY_PARAMS,
) =>
  queryOptions({
    queryKey: [...userQueryKeys.activityLogs, params],
    queryFn: () => getManyDeepcrawlLogs(params),
    ...baseQueryOptions,
  });
