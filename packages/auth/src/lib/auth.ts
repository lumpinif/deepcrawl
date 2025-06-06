import betterAuth from '@deepcrawl/auth/configs/auth.next';

/**
 *  @warning cli auth schemas generation also uses this
 */
export const auth: ReturnType<typeof betterAuth> = betterAuth({});
