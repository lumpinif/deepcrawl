import type { ClientOptions } from 'better-auth';
import {
  adminClient,
  apiKeyClient,
  genericOAuthClient,
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  passkeyClient,
} from 'better-auth/client/plugins';

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
    ],
    fetchOptions: {
      credentials: 'include',
    },
  } satisfies ClientOptions;

  return config;
}
