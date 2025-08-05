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

import { userQueryKeys } from './query-keys';
import { baseQueryOptions } from './query-options.server';

/** @client
 * Query options for the current authenticated session
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const sessionQueryOptionsClient = () =>
  queryOptions({
    queryKey: userQueryKeys.session,
    queryFn: getSession,
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
export const deviceSessionsQueryOptionsClient = () =>
  queryOptions({
    queryKey: userQueryKeys.deviceSessions,
    queryFn: listDeviceSessions,
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
