import betterAuth from '@deepcrawl/auth/configs/auth.next';
import { nextCookies } from 'better-auth/next-js';

/**
 *  Auth instance for nextjs Server Components
 *  auth schemas generation also uses this
 */
export const auth: ReturnType<typeof betterAuth> = betterAuth({
  plugins: [nextCookies()], // make sure this is the last plugin in the array
});
