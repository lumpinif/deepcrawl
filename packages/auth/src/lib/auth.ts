import betterAuth from '@deepcrawl/auth/configs/auth.next';

/**
 *  @warning only for cli auth schemas generation
 *  @warning do not use this in production
 */
export const auth: ReturnType<typeof betterAuth> = betterAuth({});
