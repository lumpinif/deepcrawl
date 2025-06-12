'use server';

import { auth } from '@deepcrawl/auth/lib/auth';
import type { Session } from '@deepcrawl/auth/types';
import type { ActiveOrganization } from '@/lib/auth.client-types';
import { headers } from 'next/headers';
import { revalidateTag, unstable_cache } from 'next/cache';

/**
 * Fetch the current authenticated session
 * Cached to reduce database calls
 */
export async function fetchAuthSession(): Promise<Session | null> {
  const requestHeaders = await headers();
  
  return unstable_cache(
    async (headers: Headers) => {
      const session = await auth.api.getSession({
        headers,
      });
      return session;
    },
    ['auth-session'],
    {
      tags: ['auth-session'],
      revalidate: 300, // 5 minutes
    }
  )(requestHeaders);
}

/**
 * Fetch all active sessions for the current user
 * Cached to reduce database calls
 */
export async function fetchListSessions(): Promise<Session['session'][]> {
  const requestHeaders = await headers();
  
  return unstable_cache(
    async (headers: Headers) => {
      try {
        const result = await auth.api.listSessions({
          headers,
        });
        return JSON.parse(JSON.stringify(result));
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to fetch active sessions');
      }
    },
    ['list-sessions'],
    {
      tags: ['list-sessions', 'user-sessions'],
      revalidate: 120, // 2 minutes
    }
  )(requestHeaders);
}

/**
 * Fetch all device sessions for the current user
 * Cached to reduce database calls
 */
export async function fetchDeviceSessions(): Promise<Session['session'][]> {
  const requestHeaders = await headers();
  
  return unstable_cache(
    async (headers: Headers) => {
      try {
        const result = await auth.api.listDeviceSessions({
          headers,
        });
        return JSON.parse(JSON.stringify(result));
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Failed to fetch device sessions');
      }
    },
    ['device-sessions'],
    {
      tags: ['device-sessions', 'user-sessions'],
      revalidate: 120, // 2 minutes
    }
  )(requestHeaders);
}

/**
 * Fetch the full organization details
 * Cached to reduce database calls
 */
export async function fetchOrganization(): Promise<ActiveOrganization | null> {
  const requestHeaders = await headers();
  
  return unstable_cache(
    async (headers: Headers) => {
      const result = await auth.api.getFullOrganization({
        headers,
      });
      return JSON.parse(JSON.stringify(result));
    },
    ['organization'],
    {
      tags: ['organization'],
      revalidate: 300, // 5 minutes
    }
  )(requestHeaders);
}

/**
 * Revalidate session-related caches after mutations
 * Call this after session modifications (revoke, login, etc.)
 */
export async function revalidateSessionCaches() {
  'use server';
  
  // Invalidate all session-related caches
  revalidateTag('user-sessions');
  revalidateTag('list-sessions');
  revalidateTag('device-sessions');
  revalidateTag('auth-session');
}
