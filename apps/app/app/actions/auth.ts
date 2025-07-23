'use server';

import { auth } from '@deepcrawl/auth/lib/auth';
import type { Session } from '@deepcrawl/auth/types';
import { getDrizzleDB, schema } from '@deepcrawl/db';
import { desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import type { ActiveOrganization } from '@/lib/auth.client-types';

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

  return JSON.parse(JSON.stringify(session));
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
export async function fetchDeviceSessions(): Promise<Session[]> {
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
 * Update the name of the most recently created passkey
 * No server-side caching - React Query handles client caching
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

    // Get the most recent passkey for this user
    const mostRecentPasskey = await db
      .select({ id: schema.passkey.id })
      .from(schema.passkey)
      .where(eq(schema.passkey.userId, session.user.id))
      .orderBy(desc(schema.passkey.createdAt))
      .limit(1);

    if (mostRecentPasskey.length === 0 || !mostRecentPasskey[0]) {
      throw new Error('No passkeys found for user');
    }

    // Update the passkey name
    const result = await db
      .update(schema.passkey)
      .set({ name })
      .where(eq(schema.passkey.id, mostRecentPasskey[0].id))
      .returning({ id: schema.passkey.id, name: schema.passkey.name });

    if (result.length === 0 || !result[0]) {
      throw new Error('Failed to update passkey name');
    }

    return { success: true, passkey: result[0] };
  } catch (error) {
    console.error('Failed to update most recent passkey name:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

/**
 * Fetch user's linked OAuth accounts
 * No server-side caching - React Query handles client caching
 */
export async function fetchLinkedAccounts() {
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

    const linkedAccounts = await db
      .select({
        id: schema.account.id,
        providerId: schema.account.providerId,
        accountId: schema.account.accountId,
        createdAt: schema.account.createdAt,
        updatedAt: schema.account.updatedAt,
      })
      .from(schema.account)
      .where(eq(schema.account.userId, session.user.id))
      .orderBy(desc(schema.account.createdAt));

    return linkedAccounts;
  } catch (error) {
    console.error('Failed to fetch linked accounts:', error);
    return [];
  }
}

/**
 * Fetch user's API keys
 * No server-side caching - React Query handles client caching
 */
export async function fetchApiKeys() {
  const requestHeaders = await headers();

  try {
    const result = await auth.api.listApiKeys({
      headers: requestHeaders,
    });

    // Better Auth already returns properly typed results
    // No need to JSON.parse/stringify which removes types
    return result;
  } catch (error) {
    console.error('Failed to fetch API keys:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch API keys',
    );
  }
}

/**
 * Create a new API key
 * Uses server-side API with userId from session and server-only properties
 */
export async function createApiKey({
  name,
  expiresIn,
  prefix,
  metadata,
}: {
  name?: string;
  expiresIn?: number;
  prefix?: string;
  metadata?: Record<string, unknown>;
}) {
  const requestHeaders = await headers();

  try {
    // Get current session to extract userId
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!session?.user?.id) {
      throw new Error('Unauthorized: No valid session found');
    }

    const result = await auth.api.createApiKey({
      body: {
        name,
        expiresIn,
        prefix: prefix || 'dc_',
        metadata,
        userId: session.user.id, // Required for server-side creation
        // Server-only properties with default values
        rateLimitEnabled: true,
        rateLimitTimeWindow: 1000 * 60 * 60 * 24, // 24 hours
        rateLimitMax: 1000, // NOTE: SHOULD BE EQUAL TO OR HIGHER THAN THE HIGHEST SERVICE RATE LIMIT
        // Note: permissions will use defaultPermissions from auth config
      },
    });

    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Failed to create API key:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create API key',
    );
  }
}

/**
 * Update an API key
 * Uses server-side API with server-only properties
 */
export async function updateApiKey({
  keyId,
  name,
  enabled,
  expiresIn,
  metadata,
}: {
  keyId: string;
  name?: string;
  enabled?: boolean;
  expiresIn?: number;
  metadata?: Record<string, unknown>;
}) {
  const requestHeaders = await headers();

  try {
    const result = await auth.api.updateApiKey({
      headers: requestHeaders,
      body: {
        keyId,
        name,
        enabled,
        expiresIn,
        metadata,
      },
    });

    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Failed to update API key:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to update API key',
    );
  }
}

/**
 * Delete an API key
 * Uses server-side API
 */
export async function deleteApiKey(keyId: string) {
  const requestHeaders = await headers();

  try {
    // First, get the API key details to check if it's a protected playground key
    const apiKeys = await auth.api.listApiKeys({
      headers: requestHeaders,
    });

    const keyToDelete = apiKeys.find((key) => key.id === keyId);

    if (!keyToDelete) {
      throw new Error('API key not found');
    }

    // DISABLED: SINCE WE ARE NOT USING PLAYGROUND_API_KEYS ANYMORE
    // Check if this is a protected PLAYGROUND_API_KEY
    // let metadata = keyToDelete.metadata;
    // if (typeof metadata === 'string') {
    //   try {
    //     metadata = JSON.parse(metadata);
    //   } catch (e) {
    //     metadata = null;
    //   }
    // }

    // if (
    //   keyToDelete.name === 'PLAYGROUND_API_KEY' &&
    //   metadata &&
    //   typeof metadata === 'object' &&
    //   (metadata as Record<string, unknown>).type === 'auto-generated' &&
    //   (metadata as Record<string, unknown>).purpose === 'playground'
    // ) {
    //   throw new Error(
    //     'This key is managed by the system and cannot be deleted',
    //   );
    // }

    const result = await auth.api.deleteApiKey({
      headers: requestHeaders,
      body: {
        keyId,
      },
    });

    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Failed to delete API key:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to delete API key',
    );
  }
}

/**
 * Ensures the user has a PLAYGROUND_API_KEY for playground access
 * Creates one if it doesn't exist with the same configuration as for new users
 */
// export async function ensurePlaygroundApiKey() {
//   const requestHeaders = await headers();

//   try {
//     // Get current session
//     const session = await auth.api.getSession({
//       headers: requestHeaders,
//     });

//     if (!session?.user?.id) {
//       throw new Error('Unauthorized: No valid session found');
//     }

//     // Check if user already has a PLAYGROUND_API_KEY
//     const apiKeys = await auth.api.listApiKeys({
//       headers: requestHeaders,
//     });

//     const playgroundKey = apiKeys.find((key) => {
//       let metadata = key.metadata;
//       // Parse metadata if it's stored as JSON string
//       if (typeof metadata === 'string') {
//         try {
//           metadata = JSON.parse(metadata);
//         } catch (e) {
//           metadata = null;
//         }
//       }

//       return (
//         key.name === 'PLAYGROUND_API_KEY' &&
//         metadata &&
//         typeof metadata === 'object' &&
//         metadata.type === 'auto-generated' &&
//         metadata.purpose === 'playground'
//       );
//     });

//     // If playground key exists, return it
//     if (playgroundKey) {
//       return JSON.parse(JSON.stringify(playgroundKey));
//     }

//     // Create a new PLAYGROUND_API_KEY with the same config as for new users

//     const result = await auth.api.createApiKey({
//       body: {
//         userId: session.user.id,
//         ...PLAYGROUND_API_KEY_CONFIG,
//       },
//     });

//     return JSON.parse(JSON.stringify(result));
//   } catch (error) {
//     console.error('❌ Failed to ensure playground API key:', error);
//     throw new Error(
//       error instanceof Error
//         ? error.message
//         : 'Failed to ensure playground API key',
//     );
//   }
// }

/**
 * Set a password for users who don't have one (e.g., OAuth users)
 * This is a server-only operation for security
 */
export async function setPassword(newPassword: string) {
  const requestHeaders = await headers();

  try {
    const result = await auth.api.setPassword({
      body: {
        newPassword,
      },
      headers: requestHeaders,
    });

    return result;
  } catch (error) {
    // Check if user already has a password
    if (
      error instanceof Error &&
      error.message.includes('already has a password')
    ) {
      throw new Error(
        'User already has a password. Please use change password instead.',
      );
    }
    console.error('Failed to set password:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to set password',
    );
  }
}
