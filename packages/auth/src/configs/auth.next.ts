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
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID as string,
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET as string,
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env
          .NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
      },
      options,
    ),
  );
}
