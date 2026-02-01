import type { auth } from '@deepcrawl/auth/lib/auth';

export type { Passkey } from '@better-auth/passkey';

/** Auth instance for Next.js Server Components */
export type Auth = typeof auth;
/** Session type for Next.js Server Components */
export type Session = typeof auth.$Infer.Session;

/**
 * The type for listSessions
 */
export type ListSessions = Awaited<ReturnType<typeof auth.api.listSessions>>;

/**
 * The type for listUserAccounts
 */
export type ListUserAccounts = Awaited<
  ReturnType<typeof auth.api.listUserAccounts>
>;

/**
 * Use the specific return type of listDeviceSessions instead of the generic Session type
 * auth.api.listDeviceSessions() returns sessions without admin-specific fields, causing the type mismatch
 */
export type ListDeviceSessions = Awaited<
  ReturnType<typeof auth.api.listDeviceSessions>
>;

/**
 * The session type for listDeviceSessions, without admin-specific fields
 */
export type ListDeviceSession = ListDeviceSessions[number];

/**
 * The user type for listDeviceSessions, without admin-specific fields
 */
export type LDSUser = ListDeviceSessions[number]['user'];

/**
 * The session type for listDeviceSessions, without admin-specific fields
 */
export type LDSSession = ListDeviceSessions[number]['session'];

/**
 * The type for listApiKeys
 */
export type ListApiKeys = Awaited<ReturnType<typeof auth.api.listApiKeys>>;

/**
 * The type for ApiKey
 */
export type ApiKey = ListApiKeys[number];
