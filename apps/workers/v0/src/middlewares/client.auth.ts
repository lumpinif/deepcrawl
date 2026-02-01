import { createAuthClientConfig } from '@deepcrawl/auth/configs/auth.client.config';
import {
  type BetterAuthClientOptions,
  createAuthClient,
} from 'better-auth/client';
import type { AppContext } from '@/lib/context';

export function getAuthClient(
  c: AppContext,
  options: BetterAuthClientOptions = {},
) {
  const baseAuthClientConfig = createAuthClientConfig({
    baseURL: c.env.BETTER_AUTH_URL,
  });

  const headers = new Headers(c.req.raw.headers);

  return createAuthClient({
    ...baseAuthClientConfig,
    plugins: [...baseAuthClientConfig.plugins, ...(options.plugins || [])],
    fetchOptions: {
      ...baseAuthClientConfig.fetchOptions,
      ...options.fetchOptions,
      headers,
    },
    ...options,
  });
}
