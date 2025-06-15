import type { auth } from '@deepcrawl/auth/lib/auth';
import {
  adminClient,
  genericOAuthClient,
  inferAdditionalFields,
  magicLinkClient,
  multiSessionClient,
  organizationClient,
  passkeyClient,
  twoFactorClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { toast } from 'sonner';

export const authClient = createAuthClient({
  basePath: '/api/auth',
  baseURL:
    process.env.NODE_ENV === 'production'
      ? 'https://auth.deepcrawl.dev'
      : 'http://localhost:8787',
  plugins: [
    organizationClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = '/auth/two-factor';
      },
    }),
    adminClient(),
    passkeyClient(),
    magicLinkClient(),
    multiSessionClient(),
    genericOAuthClient(),
    inferAdditionalFields<typeof auth>(),
    // oneTapClient({
    // 	clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    // 	promptOptions: {
    // 		maxAttempts: 1,
    // 	},
    // }),
  ],
  fetchOptions: {
    credentials: 'include',
    onError(e) {
      if (e.error.status === 429) {
        toast.error('Too many requests. Please try again later.');
      }
      // Enhanced debugging for production issues
      console.error('❌ Auth Client Error:', {
        status: e.error.status,
        message: e.error.message,
        url: e.error.url,
        baseURL:
          process.env.NODE_ENV === 'production'
            ? 'https://auth.deepcrawl.dev'
            : 'http://localhost:8787',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    },
  },
});

export const {
  signUp,
  signIn,
  signOut,
  useSession,
  organization,
  useListOrganizations,
  useActiveOrganization,
} = authClient;
