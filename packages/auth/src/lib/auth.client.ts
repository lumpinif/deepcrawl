import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  plugins: [adminClient()],
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:8787',
  basePath: '/api/auth',
  fetchOptions: {
    credentials: 'include',
  },
});
