import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { createAuthConfig } from '../configs';

// This file is specifically for Next.js Server Components usage.
// It should NOT be used in Cloudflare Workers.
const createAuthInstance = () => {
  const authConfig = createAuthConfig({
    AUTH_WORKER_NODE_ENV:
      (process.env.NODE_ENV as 'production' | 'development') || 'development',
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID as string,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET as string,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env
      .NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    // Email configuration - add these for Next.js email functionality
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FROM_EMAIL: process.env.FROM_EMAIL,
    // Default to true (use auth worker) unless explicitly set to 'false'
    NEXT_PUBLIC_USE_AUTH_WORKER:
      process.env.NEXT_PUBLIC_USE_AUTH_WORKER !== 'false',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    IS_WORKERD: false,
  });

  return betterAuth({
    ...authConfig,
    plugins: [
      ...authConfig.plugins,
      nextCookies(), // Next.js specific - keep last
    ],
  });
};

type AuthInstance = ReturnType<typeof createAuthInstance>;

let authInstance: AuthInstance | null = null;

/**
 *  Auth instance for Next.js Server Components.
 *  This should NOT be used in Cloudflare Workers.
 *
 *  For Cloudflare Workers, use createAuthConfig() directly with env variables.
 */
export const getAuth = (): AuthInstance => {
  if (!authInstance) {
    authInstance = createAuthInstance();
  }

  return authInstance;
};

export const authHandler = (request: Parameters<AuthInstance['handler']>[0]) =>
  getAuth().handler(request);

export type Auth = AuthInstance;
