import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { createAuthConfig } from '../configs';

// This file is specifically for Next.js Server Components usage
// It should NOT be used in Cloudflare Workers

const authConfigs = createAuthConfig({
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
});

/**
 *  Auth instance for Next.js Server Components
 *  This should NOT be used in Cloudflare Workers
 *
 *  For Cloudflare Workers, use createAuthConfig() directly with env variables
 */
export const auth = betterAuth({
  ...authConfigs,
  plugins: [
    ...authConfigs.plugins,
    nextCookies(), // This plugin is Next.js specific
  ],
});
