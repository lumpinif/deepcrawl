'use server';

import { auth } from '@deepcrawl/auth/lib/auth';
import type {
  ListApiKeys,
  ListDeviceSessions,
  ListSessions,
  ListUserAccounts,
  Session,
} from '@deepcrawl/auth/types';
import type { Passkey } from 'better-auth/plugins/passkey';
import { headers } from 'next/headers';
import type { ActiveOrganization } from '@/lib/auth.client-types';

/**
 * Auth Server API Call:
 * the current authenticated session
 */
export async function authGetSession(): Promise<Session | null> {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  return session;
}

/**
 * Auth Server API Call:
 * all active sessions for the current user
 */
export async function authListSessions(): Promise<ListSessions> {
  const requestHeaders = await headers();

  try {
    const result = await auth.api.listSessions({
      headers: requestHeaders,
    });
    return result;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to fetch active sessions',
    );
  }
}

/**
 * Auth Server API Call:
 * all device sessions for the current user
 */
export async function authListDeviceSessions(): Promise<ListDeviceSessions> {
  const requestHeaders = await headers();

  try {
    const result = await auth.api.listDeviceSessions({
      headers: requestHeaders,
    });

    return result;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to fetch device sessions',
    );
  }
}

/**
 * Auth Server API Call:
 * the full organization details
 */
export async function authGetFullOrganization(): Promise<ActiveOrganization | null> {
  const requestHeaders = await headers();
  try {
    const result = await auth.api.getFullOrganization({
      headers: requestHeaders,
    });
    return result;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch organization',
    );
  }
}

/**
 * Auth Server API Call:
 * user's passkeys using Better Auth official API
 */
export async function authListPasskeys(): Promise<Passkey[]> {
  const requestHeaders = await headers();

  try {
    const passkeys = await auth.api.listPasskeys({
      headers: requestHeaders,
    });

    return passkeys;
  } catch (error) {
    console.error('Failed to fetch passkeys:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch passkeys',
    );
  }
}

/**
 * Auth Server API Call:
 * user's linked OAuth accounts
 */
export async function authListUserAccounts(): Promise<ListUserAccounts> {
  const requestHeaders = await headers();

  try {
    const accounts = await auth.api.listUserAccounts({
      headers: requestHeaders,
    });

    return accounts;
  } catch (error) {
    console.error('Failed to fetch linked accounts:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to fetch linked accounts',
    );
  }
}

/**
 * Auth Server API Call:
 * user's API keys
 */
export async function authListApiKeys(): Promise<ListApiKeys> {
  const requestHeaders = await headers();

  try {
    const result = await auth.api.listApiKeys({
      headers: requestHeaders,
    });

    return result;
  } catch (error) {
    console.error('Failed to fetch API keys:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch API keys',
    );
  }
}
