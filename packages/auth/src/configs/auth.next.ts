import { betterAuth as betterAuthInstance } from 'better-auth';
import { type BetterAuthOptions, createAuthConfig } from './auth.config';

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

