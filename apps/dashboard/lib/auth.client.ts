import type { auth } from '@deepcrawl/auth/lib/auth';
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  plugins: [adminClient(), inferAdditionalFields<typeof auth>()],
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:8787',
  basePath: '/api/auth',
  fetchOptions: {
    credentials: 'include',
  },
});

export type Session = typeof authClient.$Infer.Session;
