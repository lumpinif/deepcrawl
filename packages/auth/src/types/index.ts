import type { Auth as AuthInstance } from '@deepcrawl/auth/lib/auth';

export type { Passkey } from '@better-auth/passkey';

/** Auth instance for Next.js Server Components */
export type Auth = AuthInstance;
/** Session type for Next.js Server Components */
export type Session = AuthInstance['$Infer']['Session'];

/**
 * The type for listSessions
 */
export type ListSessions = Awaited<
  ReturnType<AuthInstance['api']['listSessions']>
>;

/**
 * The type for listUserAccounts
 */
export type ListUserAccounts = Awaited<
  ReturnType<AuthInstance['api']['listUserAccounts']>
>;

/**
 * Use the specific return type of listDeviceSessions instead of the generic Session type
 * auth.api.listDeviceSessions() returns sessions without admin-specific fields, causing the type mismatch
 */
export type ListDeviceSessions = Awaited<
  ReturnType<AuthInstance['api']['listDeviceSessions']>
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
export type ListApiKeys = Awaited<
  ReturnType<AuthInstance['api']['listApiKeys']>
>;

/**
 * The type for ApiKey
 */
export type ApiKey = ListApiKeys[number];
