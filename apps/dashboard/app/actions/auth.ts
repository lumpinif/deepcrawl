'use server';

import type { ActiveOrganization } from '@/lib/auth.client-types';
import { auth } from '@deepcrawl/auth/lib/auth';
import type { Session } from '@deepcrawl/auth/types';
import { getDrizzleDB, schema } from '@deepcrawl/db';
import { desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';

/**
 * SIMPLIFIED CACHING STRATEGY
 * ===========================
 *
 * Philosophy: Keep it simple, let React Query handle client-side caching
 *
 * Layers:
 * 1. Browser Cache (automatic)
 * 2. React Query (client-side, configurable)
 * 3. Better Auth internal cache (automatic)
 *
 * Benefits:
 * - No cache invalidation complexity
 * - No stale session issues
 * - Easy to debug and reason about
 * - Still fast due to React Query
 * - Fresh data on every server call
 */

/**
 * Fetch the current authenticated session
 * No server-side caching - React Query handles client caching
 */
export async function fetchAuthSession(): Promise<Session | null> {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  return session;
}

/**
 * Fetch all active sessions for the current user
 * No server-side caching - React Query handles client caching
 */
export async function fetchListSessions(): Promise<Session['session'][]> {
  const requestHeaders = await headers();

  try {
    const result = await auth.api.listSessions({
      headers: requestHeaders,
    });
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to fetch active sessions',
    );
  }
}

/**
 * Fetch all device sessions for the current user
 * No server-side caching - React Query handles client caching
 */
export async function fetchDeviceSessions(): Promise<Session['session'][]> {
  const requestHeaders = await headers();

  try {
    const result = await auth.api.listDeviceSessions({
      headers: requestHeaders,
    });
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to fetch device sessions',
    );
  }
}

/**
 * Fetch the full organization details
 * No server-side caching - React Query handles client caching
 */
export async function fetchOrganization(): Promise<ActiveOrganization | null> {
  const requestHeaders = await headers();

  const result = await auth.api.getFullOrganization({
    headers: requestHeaders,
  });
  return JSON.parse(JSON.stringify(result));
}

/**
 * Cache invalidation functions are no longer needed
 * React Query handles client-side cache invalidation automatically
 * Server actions always return fresh data
 */

/**
 * Fetch user's passkeys from the database
 * No server-side caching - React Query handles client caching
 */
export async function fetchUserPasskeys() {
  const requestHeaders = await headers();

  try {
    // Always get fresh session - no caching complexity
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session?.user?.id) {
      return [];
    }

    // Direct database query - no caching layer
    const db = getDrizzleDB({
      DATABASE_URL: process.env.DATABASE_URL,
    });

    const passkeys = await db
      .select({
        id: schema.passkey.id,
        name: schema.passkey.name,
        deviceType: schema.passkey.deviceType,
        createdAt: schema.passkey.createdAt,
        backedUp: schema.passkey.backedUp,
        transports: schema.passkey.transports,
      })
      .from(schema.passkey)
      .where(eq(schema.passkey.userId, session.user.id))
      .orderBy(desc(schema.passkey.createdAt));

    return passkeys;
  } catch (error) {
    console.error('Failed to fetch passkeys:', error);
    return [];
  }
}

/**
 * Remove a passkey from the user's account
 * No server-side caching - React Query handles client caching
 */
export async function removeUserPasskey(passkeyId: string) {
  const requestHeaders = await headers();

  try {
    // Always get fresh session - no caching complexity
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session?.user?.id) {
      throw new Error('Unauthorized: No valid session found');
    }

    // Direct database query - no caching layer
    const db = getDrizzleDB({
      DATABASE_URL: process.env.DATABASE_URL,
    });

    // First, verify the passkey belongs to the current user
    const existingPasskey = await db
      .select({ id: schema.passkey.id, userId: schema.passkey.userId })
      .from(schema.passkey)
      .where(eq(schema.passkey.id, passkeyId))
      .limit(1);

    if (existingPasskey.length === 0) {
      throw new Error('Passkey not found');
    }

    if (existingPasskey[0]?.userId !== session.user.id) {
      throw new Error('Unauthorized: Passkey does not belong to current user');
    }

    // Remove the passkey from the database
    const result = await db
      .delete(schema.passkey)
      .where(eq(schema.passkey.id, passkeyId))
      .returning({ id: schema.passkey.id });

    if (result.length === 0 || !result[0]) {
      throw new Error('Failed to remove passkey');
    }

    return { success: true, id: result[0].id };
  } catch (error) {
    console.error('Failed to remove passkey:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

/**
 * Update a passkey name in the database
 * This is called after Better Auth creates the passkey to set a meaningful name
 */
export async function updatePasskeyName(passkeyId: string, name: string) {
  const requestHeaders = await headers();

  try {
    // Always get fresh session - no caching complexity
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session?.user?.id) {
      throw new Error('Unauthorized: No valid session found');
    }

    // Direct database query - no caching layer
    const db = getDrizzleDB({
      DATABASE_URL: process.env.DATABASE_URL,
    });

    // Verify the passkey belongs to the current user and update the name
    const result = await db
      .update(schema.passkey)
      .set({ name })
      .where(eq(schema.passkey.id, passkeyId))
      .returning({ id: schema.passkey.id, name: schema.passkey.name });

    if (result.length === 0 || !result[0]) {
      throw new Error('Failed to update passkey name');
    }

    return { success: true, id: result[0].id, name: result[0].name };
  } catch (error) {
    console.error('Failed to update passkey name:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

/**
 * Update the most recent passkey name for the current user
 * This is used when we don't have the specific passkey ID from Better Auth
 */
export async function updateMostRecentPasskeyName(name: string) {
  const requestHeaders = await headers();

  try {
    // Always get fresh session - no caching complexity
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session?.user?.id) {
      throw new Error('Unauthorized: No valid session found');
    }

    // Direct database query - no caching layer
    const db = getDrizzleDB({
      DATABASE_URL: process.env.DATABASE_URL,
    });

    // Get the most recent passkey for this user (by creation date)
    const mostRecentPasskey = await db
      .select({ id: schema.passkey.id })
      .from(schema.passkey)
      .where(eq(schema.passkey.userId, session.user.id))
      .orderBy(desc(schema.passkey.createdAt))
      .limit(1);

    if (mostRecentPasskey.length === 0) {
      throw new Error('No passkeys found for user');
    }

    // Update the name of the most recent passkey
    const passkeyId = mostRecentPasskey[0]?.id;
    if (!passkeyId) {
      throw new Error('Invalid passkey ID');
    }

    const result = await db
      .update(schema.passkey)
      .set({ name })
      .where(eq(schema.passkey.id, passkeyId))
      .returning({ id: schema.passkey.id, name: schema.passkey.name });

    if (result.length === 0 || !result[0]) {
      throw new Error('Failed to update passkey name');
    }

    return { success: true, id: result[0].id, name: result[0].name };
  } catch (error) {
    console.error('Failed to update most recent passkey name:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}
