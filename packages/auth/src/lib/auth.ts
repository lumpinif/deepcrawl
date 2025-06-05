import betterAuth from '../configs/auth.config';

/**
 *  @warning only for cli auth schemas generation
 *  @warning do not use this in production
 */
export const auth: ReturnType<typeof betterAuth> = betterAuth({});
