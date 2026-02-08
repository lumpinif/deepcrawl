'use client';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ensurePlaygroundApiKey } from '@/lib/playground-api-key.client';
import { shouldUsePlaygroundApiKey } from '@/lib/playground-api-key-policy';
import { userQueryKeys } from '@/query/query-keys';

/**
 * Ensures the system-managed `PLAYGROUND_API_KEY` exists and is persisted
 * on the current device.
 *
 * This runs only for dashboard routes to avoid side effects on marketing/docs pages.
 */
export function PlaygroundApiKeyBootstrap() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const didRunRef = useRef(false);

  useEffect(() => {
    if (!pathname.startsWith('/app')) {
      return;
    }

    if (!shouldUsePlaygroundApiKey()) {
      return;
    }

    if (didRunRef.current) {
      return;
    }

    didRunRef.current = true;

    void (async () => {
      try {
        await ensurePlaygroundApiKey();
        queryClient.invalidateQueries({ queryKey: userQueryKeys.apiKeys });
      } catch {
        // Silent by default. We show a guided toast when the user actually
        // triggers an action that requires the key.
      }
    })();
  }, [pathname, queryClient]);

  return null;
}
