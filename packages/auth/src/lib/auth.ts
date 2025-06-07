import betterAuth from '@deepcrawl/auth/configs/auth.next';

/**
 *  Auth instance for nextjs Server Components
 *  auth schemas generation also uses this
 */
export const auth: ReturnType<typeof betterAuth> = betterAuth({});
