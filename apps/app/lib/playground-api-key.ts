export const PLAYGROUND_API_KEY_NAME = 'PLAYGROUND_API_KEY';

// Local storage key for the system-managed playground API key.
// Versioned so we can change the shape safely in the future.
const PLAYGROUND_API_KEY_STORAGE_KEY = 'deepcrawl.playgroundApiKey.v1';

export type StoredPlaygroundApiKey = {
  key: string;
  keyId?: string;
  createdAt: string;
};

export function isPlaygroundApiKeyName(name: string | null | undefined) {
  return name === PLAYGROUND_API_KEY_NAME;
}

export function getStoredPlaygroundApiKey(): StoredPlaygroundApiKey | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(PLAYGROUND_API_KEY_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredPlaygroundApiKey> | null;
    if (!parsed || typeof parsed.key !== 'string' || parsed.key.length === 0) {
      return null;
    }

    return {
      key: parsed.key,
      keyId: typeof parsed.keyId === 'string' ? parsed.keyId : undefined,
      createdAt:
        typeof parsed.createdAt === 'string' && parsed.createdAt.length > 0
          ? parsed.createdAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function setStoredPlaygroundApiKey(key: string, keyId?: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const cleanKey = key.trim();
  if (cleanKey.length === 0) {
    return;
  }

  try {
    const value: StoredPlaygroundApiKey = {
      key: cleanKey,
      keyId:
        typeof keyId === 'string' && keyId.trim().length > 0
          ? keyId
          : undefined,
      createdAt: new Date().toISOString(),
    };
    window.localStorage.setItem(
      PLAYGROUND_API_KEY_STORAGE_KEY,
      JSON.stringify(value),
    );
  } catch {
    // Ignore storage failures (Safari private mode, quota, etc.)
  }
}

export function clearStoredPlaygroundApiKey() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(PLAYGROUND_API_KEY_STORAGE_KEY);
  } catch {
    // Ignore
  }
}
