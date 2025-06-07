import { getDrizzleDB, schema } from '@deepcrawl/db';
import type { BetterAuthOptions as BetterAuthOptionsType } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, apiKey } from 'better-auth/plugins';
import { defaultOptions } from './default-options';

interface Env {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  DATABASE_URL: string;
}

export interface BetterAuthOptions extends BetterAuthOptionsType {}

/** Important: make sure always import this explicitly in workers to resolve process.env issues
 *  Factory function that accepts environment variables from cloudflare env
 */
export function createAuthConfig(
  env: Env,
  options?: BetterAuthOptions,
): BetterAuthOptionsType {
  const db = getDrizzleDB({ DATABASE_URL: env.DATABASE_URL });

  return {
    ...defaultOptions,
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: 'pg', schema: schema }),
    ...options,
    plugins: [admin(), apiKey(), ...(options?.plugins || [])],
  };
}
