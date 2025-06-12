import type { authClient } from './auth.client';

// Core Better Auth types
export type ClientSession = typeof authClient.$Infer.Session;
export type ActiveOrganization = typeof authClient.$Infer.ActiveOrganization;

// Simplified session types - just what we actually need
export type Session = NonNullable<
  Awaited<ReturnType<typeof authClient.getSession>>['data']
>;
export type SessionsList = NonNullable<
  Awaited<ReturnType<typeof authClient.listSessions>>['data']
>;
export type DeviceSessionsList = NonNullable<
  Awaited<ReturnType<typeof authClient.multiSession.listDeviceSessions>>['data']
>;

// Individual session types for better type safety
export type RawSessionData = SessionsList[number];
export type FullSessionData = DeviceSessionsList[number];

// Extract the session part from both types for consistent access
export type SessionInfo = Session['session'];

// Union type for any session item (handles both raw sessions and full session objects)
export type AnySession = RawSessionData | FullSessionData;

// Type guard to check if session has full structure
export function isFullSession(session: AnySession): session is FullSessionData {
  return 'session' in session && 'user' in session;
}

// Helper function to extract session data with proper typing
export function getSessionInfo(sessionItem: AnySession): SessionInfo {
  return isFullSession(sessionItem) ? sessionItem.session : sessionItem;
}
