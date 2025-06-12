import { betterAuth } from 'better-auth';
import { createAuthConfig } from '../configs';

/**
 *  Auth instance for nextjs Server Components
 *  auth schemas generation also uses this
 */
export const auth = betterAuth(
  createAuthConfig({
    AUTH_WORKER_NODE_ENV:
      (process.env.AUTH_WORKER_NODE_ENV as 'production' | 'development') ||
      'development',
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID as string,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET as string,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env
      .NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  }),
);
