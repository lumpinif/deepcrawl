import type {
  ListApiKeys,
  ListDeviceSessions,
  ListSessions,
  ListUserAccounts,
  Passkey,
  Session,
} from '@deepcrawl/auth/types';
import { authClient } from '@/lib/auth.client';
import type { ActiveOrganization } from '@/lib/auth.client-types';

/**
 * Auth Client API Call:
 * the current authenticated session
 */
export async function getSession(): Promise<Session | null> {
  const { data: session, error } = await authClient.getSession();

  if (error) {
    console.error(
      '❌ [Auth Query Client] Failed to get session:',
      error.message,
    );
    throw new Error(error.message);
  }

  return session;
}

/**
 * Auth Client API Call:
 * all active sessions for the current user
 * @description listSessions returns all active sessions for the current user across all devices
 */
export async function listSessions(): Promise<ListSessions> {
  const { data: sessions, error } = await authClient.listSessions();

  if (error) {
    console.error(
      '❌ [Auth Query Client] Failed to fetch active sessions:',
      error.message,
    );
    throw new Error(error.message);
  }

  return sessions;
}

/**
 * Auth Client API Call:
 * all device sessions for the current user
 * @description listDeviceSessions (from the multi-session plugin) returns sessions for different user accounts stored in the same browser/device.
 */
export async function listDeviceSessions(): Promise<ListDeviceSessions> {
  const { data: sessions, error } =
    await authClient.multiSession.listDeviceSessions();

  if (error) {
    console.error(
      '❌ [Auth Query Client] Failed to fetch device sessions:',
      error.message,
    );
    throw new Error(error.message);
  }

  return sessions;
}

/**
 * Auth Client API Call:
 * the full organization details
 */
export async function getFullOrganization(): Promise<ActiveOrganization | null> {
  const { data: organization, error } =
    await authClient.organization.getFullOrganization();

  if (error) {
    console.error(
      '❌ [Auth Query Client] Failed to fetch organization:',
      error.message,
    );
    throw new Error(error.message);
  }

  return organization;
}

/**
 * Auth Client API Call:
 * user's passkeys using Better Auth official API
 */
export async function listUserPasskeys(): Promise<Passkey[]> {
  const { data: passkeys, error } = await authClient.passkey.listUserPasskeys();

  if (error) {
    console.error(
      '❌ [Auth Query Client] Failed to fetch passkeys:',
      error.message,
    );
    throw new Error(error.message);
  }

  return passkeys;
}

/**
 * Auth Client API Call:
 * user's linked OAuth accounts
 */
export async function listAccounts(): Promise<ListUserAccounts> {
  const { data: accounts, error } = await authClient.listAccounts();

  if (error) {
    console.error(
      '❌ [Auth Query Client] Failed to fetch linked accounts:',
      error.message,
    );
    throw new Error(error.message);
  }

  return accounts;
}

/**
 * Auth Client API Call:
 * user's API keys
 */
export async function listApiKeys(): Promise<ListApiKeys> {
  const { data: apiKeys, error } = await authClient.apiKey.list();

  if (error) {
    console.error(
      '❌ [Auth Query Client] Failed to fetch API keys:',
      error.message,
    );
    throw new Error(error.message);
  }

  return apiKeys;
}
