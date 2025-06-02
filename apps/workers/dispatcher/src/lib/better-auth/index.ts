import { getDrizzleDB } from '@/db';
import * as schema from '@/db/schema';
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
    database: drizzleAdapter(db, { provider: 'pg', schema: schema }),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    // add other domains to trustedOrigins, such as tenant domains
    trustedOrigins: [
      'http://localhost:8787',
      env.BETTER_AUTH_URL,
      `*.${env.BETTER_AUTH_URL}`,
    ],
    // Additional options that depend on env ...
  });
};

// export function createAuth(env: CloudflareBindings) {
//   return auth(env);
// }

export function createBetterAuth(env: CloudflareBindings) {
  return auth(env);
}

export type AuthType = ReturnType<typeof createBetterAuth>;
export type Session = AuthType['$Infer']['Session'];
