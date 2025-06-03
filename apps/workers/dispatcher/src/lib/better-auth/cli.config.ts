/**
 * @local only
 * Used for local cli commands
 */

import { getDrizzleDB } from '@/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuthOptions } from './options';

const { BETTER_AUTH_URL, BETTER_AUTH_SECRET, DATABASE_URL } = process.env as {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  DATABASE_URL: string;
};

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  ...betterAuthOptions,
  database: drizzleAdapter(getDrizzleDB({ DATABASE_URL }), { provider: 'pg' }),
  baseURL: BETTER_AUTH_URL,
  secret: BETTER_AUTH_SECRET,
});
