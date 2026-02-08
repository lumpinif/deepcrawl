'use client';

import { authClient } from '@/lib/auth.client';
import {
  clearStoredPlaygroundApiKey,
  getStoredPlaygroundApiKey,
  PLAYGROUND_API_KEY_NAME,
  type StoredPlaygroundApiKey,
  setStoredPlaygroundApiKey,
} from '@/lib/playground-api-key';

let ensurePromise: Promise<string> | null = null;

function buildPlaygroundKeyMetadata() {
  return {
    type: 'auto-generated',
    purpose: 'playground',
    createdAt: new Date().toISOString(),
  };
}

type StoredKeyCheck =
  | { kind: 'valid' }
  | { kind: 'invalid' }
  | { kind: 'unverified' };

async function checkStoredPlaygroundApiKey(
  stored: StoredPlaygroundApiKey,
): Promise<StoredKeyCheck> {
  // Best-effort validation without consuming API key usage.
  // If we can't validate (no Better Auth session), we optimistically trust the
  // stored key so API-key auth can still work when cookie auth fails.
  const session = await authClient.getSession();
  if (session.error || !session.data?.user?.id) {
    return { kind: 'unverified' };
  }

  const listed = await authClient.apiKey.list();
  if (listed.error) {
    return { kind: 'unverified' };
  }

  const matched = listed.data?.find((apiKey) => {
    if (apiKey.name !== PLAYGROUND_API_KEY_NAME) {
      return false;
    }

    if (stored.keyId && apiKey.id === stored.keyId) {
      return true;
    }

    const start = apiKey.start;
    if (typeof start !== 'string' || start.length === 0) {
      return false;
    }

    return stored.key.startsWith(start);
  });

  if (!matched) {
    return { kind: 'invalid' };
  }

  if (matched.enabled === false) {
    return { kind: 'invalid' };
  }

  if (matched.expiresAt) {
    const expiresAtMs = new Date(matched.expiresAt).getTime();
    if (!Number.isNaN(expiresAtMs) && Date.now() > expiresAtMs) {
      return { kind: 'invalid' };
    }
  }

  return { kind: 'valid' };
}

/**
 * Ensures a system-managed `PLAYGROUND_API_KEY` exists for the current user and
 * that the plaintext key is stored on this device.
 *
 * Notes:
 * - Better Auth only returns the plaintext key at creation time, so we must
 *   persist it client-side if we want to use it later.
 * - This is intentionally device-scoped (localStorage).
 */
export async function ensurePlaygroundApiKey(): Promise<string> {
  if (ensurePromise) {
    return ensurePromise;
  }

  ensurePromise = (async () => {
    const stored = getStoredPlaygroundApiKey();
    if (stored?.key) {
      const check = await checkStoredPlaygroundApiKey(stored);
      if (check.kind === 'valid') {
        return stored.key;
      }

      if (check.kind === 'unverified') {
        return stored.key;
      }

      // Key is invalid/expired/disabled, rotate locally.
      clearStoredPlaygroundApiKey();
    }

    // Require an authenticated Better Auth session to create the key.
    const session = await authClient.getSession();
    if (session.error || !session.data?.user?.id) {
      throw new Error('Unauthorized');
    }

    const created = await authClient.apiKey.create({
      name: PLAYGROUND_API_KEY_NAME,
      prefix: 'dc_',
      metadata: buildPlaygroundKeyMetadata(),
      // expiresIn: omitted => defaults to `null` (never expires) in Better Auth API.
    });

    if (created.error) {
      throw new Error(created.error.message);
    }

    const key = created.data?.key;
    if (!key) {
      throw new Error('Failed to create API key');
    }

    setStoredPlaygroundApiKey(key, created.data?.id);
    return key;
  })();

  try {
    return await ensurePromise;
  } finally {
    ensurePromise = null;
  }
}

export type RegeneratePlaygroundApiKeyResult = {
  key: string;
  revokedPrevious: boolean;
};

/**
 * Creates a fresh `PLAYGROUND_API_KEY` for the current user and stores it on
 * this device. Best-effort revokes the previously stored key (if we know its id).
 */
export async function regeneratePlaygroundApiKey(): Promise<RegeneratePlaygroundApiKeyResult> {
  // Require an authenticated Better Auth session to create the key.
  const session = await authClient.getSession();
  if (session.error || !session.data?.user?.id) {
    throw new Error('Unauthorized');
  }

  const previous = getStoredPlaygroundApiKey();

  const created = await authClient.apiKey.create({
    name: PLAYGROUND_API_KEY_NAME,
    prefix: 'dc_',
    metadata: buildPlaygroundKeyMetadata(),
  });

  if (created.error) {
    throw new Error(created.error.message);
  }

  const key = created.data?.key;
  if (!key) {
    throw new Error('Failed to create API key');
  }

  const keyId = created.data?.id;
  setStoredPlaygroundApiKey(key, keyId);

  let revokedPrevious = false;
  const previousId = previous?.keyId;
  if (previousId && previousId !== keyId) {
    try {
      const deleted = await authClient.apiKey.delete({ keyId: previousId });
      revokedPrevious = !deleted.error;
    } catch {
      revokedPrevious = false;
    }
  }

  return { key, revokedPrevious };
}
