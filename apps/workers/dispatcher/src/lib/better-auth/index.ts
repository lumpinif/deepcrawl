import { getDrizzleDB } from '@/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuthOptions } from './options';

/**
 * Better Auth Instance
 */
export const auth = (
  env: CloudflareBindings,
): ReturnType<typeof betterAuth> => {
  const db = getDrizzleDB({ env });

  return betterAuth({
    ...betterAuthOptions,
    database: drizzleAdapter(db, { provider: 'pg' }),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: ['http://localhost:8787', env.BETTER_AUTH_URL],
    // Additional options that depend on env ...
  });
};
