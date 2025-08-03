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
import { userQueryKeys } from './query-keys';

/**
 * Query options for the current authenticated session
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: userQueryKeys.session,
    queryFn: authGetSession,
    staleTime: 5 * 60 * 1000, // 5 minutes (matches cookie cache)
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

/**
 * Query options for active sessions list
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const listSessionsQueryOptions = () =>
  queryOptions({
    queryKey: userQueryKeys.listSessions,
    queryFn: authListSessions,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

/**
 * Query options for device sessions
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const deviceSessionsQueryOptions = () =>
  queryOptions({
    queryKey: userQueryKeys.deviceSessions,
    queryFn: authListDeviceSessions,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

/**
 * Query options for organization data
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const organizationQueryOptions = () =>
  queryOptions({
    queryKey: userQueryKeys.organization,
    queryFn: authGetFullOrganization,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });

/**
 * Query options for user passkeys
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const userPasskeysQueryOptions = () =>
  queryOptions({
    queryKey: userQueryKeys.passkeys,
    queryFn: authListPasskeys,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

/**
 * Query options for user's linked OAuth accounts
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const linkedAccountsQueryOptions = () =>
  queryOptions({
    queryKey: userQueryKeys.linkedAccounts,
    queryFn: authListUserAccounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

/**
 * Query options for user's API keys
 * Provides full type inference for useQuery, prefetchQuery, etc.
 */
export const apiKeysQueryOptions = () =>
  queryOptions({
    queryKey: userQueryKeys.apiKeys,
    queryFn: authListApiKeys,
    staleTime: 2 * 60 * 1000, // 2 minutes (API keys change less frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
