import { getDrizzleDB, schema } from '@deepcrawl/db';
import {
  type BetterAuthOptions as BetterAuthOptionsType,
  betterAuth as betterAuthInstance,
} from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { defaultOptions } from '../lib/options';

interface Env {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  DATABASE_URL: string;
}

export interface BetterAuthOptions extends BetterAuthOptionsType {}

// Factory function that accepts environment variables from cloudflare env
export function createAuthConfig(env: Env, options?: BetterAuthOptions) {
  const db = getDrizzleDB({ DATABASE_URL: env.DATABASE_URL });

  return {
    ...defaultOptions,
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: 'pg', schema: schema }),
    ...options,
  };
}

/** Main auth instance helper.
 *  A wrapper around better-auth instance.
 *  Use this in @nextjs with process.env to create auth instance
 * */
export default function betterAuth(
  options?: BetterAuthOptions,
): ReturnType<typeof betterAuthInstance> {
  return betterAuthInstance(
    createAuthConfig(
      {
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
        DATABASE_URL: process.env.DATABASE_URL as string,
      },
      options,
    ),
  );
}
