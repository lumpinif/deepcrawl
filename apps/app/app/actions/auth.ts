'use server';

import { getAuth } from '@deepcrawl/auth/lib/auth';
import { headers } from 'next/headers';
import { authGetSession } from '@/query/auth-query.server';

/**
 * Remove a passkey from the user's account using Better Auth official API
 * No server-side caching - React Query handles client caching
 */
export async function removeUserPasskey(passkeyId: string) {
  const auth = getAuth();
  const requestHeaders = await headers();

  try {
    await auth.api.deletePasskey({
      headers: requestHeaders,
      body: {
        id: passkeyId,
      },
    });

    return { success: true, id: passkeyId };
  } catch (error) {
    console.error('Failed to remove passkey:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

/**
 * Fetch user's linked OAuth accounts
 * No server-side caching - React Query handles client caching
 */
export async function fetchLinkedAccounts() {
  const auth = getAuth();
  const requestHeaders = await headers();

  try {
    const accounts = await auth.api.listUserAccounts({
      headers: requestHeaders,
    });

    return accounts;
  } catch (error) {
    console.error('Failed to fetch linked accounts:', error);
    return [];
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
  const auth = getAuth();
  try {
    // Get current session to extract userId
    const session = await authGetSession();

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
        // Note: permissions will use defaultPermissions from auth config
      },
    });

    return result;
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
  const auth = getAuth();
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

    return result;
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
  const auth = getAuth();
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

    return result;
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
//       return playgroundKey;
//     }

//     // Create a new PLAYGROUND_API_KEY with the same config as for new users

//     const result = await auth.api.createApiKey({
//       body: {
//         userId: session.user.id,
//         ...PLAYGROUND_API_KEY_CONFIG,
//       },
//     });

//     return result;
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
  const auth = getAuth();
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
