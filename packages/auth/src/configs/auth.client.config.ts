import { passkeyClient } from '@better-auth/passkey/client';
import type { BetterAuthClientOptions } from 'better-auth';
import {
  adminClient,
  apiKeyClient,
  genericOAuthClient,
  lastLoginMethodClient,
  magicLinkClient,
  multiSessionClient,
  organizationClient,
} from 'better-auth/client/plugins';
import { LAST_USED_LOGIN_METHOD_COOKIE_NAME } from './constants';

export function createAuthClientConfig({
  baseURL,
  basePath,
}: {
  baseURL: string;
  basePath?: string;
}) {
  const config = {
    baseURL,
    basePath: basePath || '/api/auth',
    plugins: [
      adminClient(),
      apiKeyClient(),
      passkeyClient(),
      magicLinkClient(),
      organizationClient(),
      multiSessionClient(),
      genericOAuthClient(),
      lastLoginMethodClient({
        cookieName: LAST_USED_LOGIN_METHOD_COOKIE_NAME,
      }),
    ],
    fetchOptions: {
      credentials: 'include',
    },
  } satisfies BetterAuthClientOptions;

  return config;
}
