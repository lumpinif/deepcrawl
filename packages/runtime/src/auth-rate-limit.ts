export type AuthenticationRateLimitRule = Readonly<{
  window: number;
  max: number;
}>;

// Better Auth built-in rate limiting for authentication endpoints (anti-abuse).
// Storage is configured by the caller (e.g. auth worker uses KV via secondary storage).
export const AUTHENTICATION_RATE_LIMIT_CUSTOM_RULES = {
  '/sign-in/email': {
    window: 10,
    max: 3,
  },
  '/sign-up/email': {
    window: 10,
    max: 3,
  },
  '/forgot-password': {
    window: 10,
    max: 3,
  },
  '/reset-password': {
    window: 10,
    max: 3,
  },
  '/verify-email': {
    window: 10,
    max: 3,
  },
  '/two-factor/*': {
    window: 10,
    max: 3,
  },
  '/magic-link/*': {
    window: 10,
    max: 3,
  },
  '/organization/accept-invitation': {
    window: 10,
    max: 3,
  },
  '/change-password': {
    window: 10,
    max: 3,
  },
  '/change-email': {
    window: 10,
    max: 3,
  },
  '/passkey/*': {
    window: 10,
    max: 3,
  },
} as const satisfies Record<string, AuthenticationRateLimitRule>;

export const AUTHENTICATION_RATE_LIMIT_CONFIG = {
  customRules: AUTHENTICATION_RATE_LIMIT_CUSTOM_RULES,
} as const;

// Better Auth built-in rate limiting used by the apiKey plugin when validating
// API keys. This is separate from the v0 API Worker rate limiting (Upstash).
export const AUTH_API_KEY_VALIDATION_RATE_LIMIT = {
  enabled: true,
  maxRequests: 20,
  timeWindow: 1000 * 60, // 60 seconds
} as const;
