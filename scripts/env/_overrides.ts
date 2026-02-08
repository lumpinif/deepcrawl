import type { EnvTarget } from '@deepcrawl/runtime/env';

export type SyncMode = 'local' | 'remote';

const LOCAL_APP_URL = 'http://localhost:3000';
const LOCAL_AUTH_WORKER_URL = 'http://localhost:8787';
const LOCAL_API_URL = 'http://localhost:8080';

export function resolveSyncMode(raw: string | undefined): SyncMode {
  if (raw === 'remote') {
    return 'remote';
  }
  return 'local';
}

function isLocalUrl(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return (
    value.startsWith('http://localhost') ||
    value.startsWith('https://localhost') ||
    value.startsWith('http://127.0.0.1') ||
    value.startsWith('https://127.0.0.1')
  );
}

function resolveLocalBetterAuthUrl(values: Record<string, string>): string {
  const useAuthWorker = values.NEXT_PUBLIC_USE_AUTH_WORKER !== 'false';
  return useAuthWorker ? LOCAL_AUTH_WORKER_URL : LOCAL_APP_URL;
}

export function applyLocalOverridesForTarget(
  target: EnvTarget,
  values: Record<string, string>,
  mode: SyncMode,
): Record<string, string> {
  if (mode !== 'local') {
    return values;
  }

  const out: Record<string, string> = { ...values };

  if (target === 'dashboard') {
    if (!isLocalUrl(out.NEXT_PUBLIC_APP_URL)) {
      out.NEXT_PUBLIC_APP_URL = LOCAL_APP_URL;
    }

    if (!isLocalUrl(out.NEXT_PUBLIC_DEEPCRAWL_API_URL)) {
      out.NEXT_PUBLIC_DEEPCRAWL_API_URL = LOCAL_API_URL;
    }

    if (!isLocalUrl(out.BETTER_AUTH_URL)) {
      out.BETTER_AUTH_URL = resolveLocalBetterAuthUrl(out);
    }

    // Next.js client code can only read NEXT_PUBLIC_* variables.
    // Keep this in sync with BETTER_AUTH_URL.
    if (!out.NEXT_PUBLIC_BETTER_AUTH_URL) {
      out.NEXT_PUBLIC_BETTER_AUTH_URL =
        out.BETTER_AUTH_URL ?? resolveLocalBetterAuthUrl(out);
    }

    return out;
  }

  if (target === 'worker-auth') {
    if (!isLocalUrl(out.NEXT_PUBLIC_APP_URL)) {
      out.NEXT_PUBLIC_APP_URL = LOCAL_APP_URL;
    }

    if (!isLocalUrl(out.BETTER_AUTH_URL)) {
      out.BETTER_AUTH_URL = LOCAL_AUTH_WORKER_URL;
    }

    return out;
  }

  if (target === 'worker-v0') {
    if (!isLocalUrl(out.NEXT_PUBLIC_APP_URL)) {
      out.NEXT_PUBLIC_APP_URL = LOCAL_APP_URL;
    }

    if (!isLocalUrl(out.BETTER_AUTH_URL)) {
      out.BETTER_AUTH_URL = resolveLocalBetterAuthUrl(out);
    }

    return out;
  }

  return out;
}
