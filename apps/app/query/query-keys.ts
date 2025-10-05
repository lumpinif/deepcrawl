// Query keys for consistency across server and client components
export const userQueryKeys = {
  session: ['user', 'session'] as const,
  listSessions: ['user', 'list-sessions'] as const,
  deviceSessions: ['user', 'device-sessions'] as const,
  organization: ['user', 'organization'] as const,
  passkeys: ['user', 'passkeys'] as const,
  listUserAccounts: ['user', 'list-user-accounts'] as const,
  apiKeys: ['user', 'api-keys'] as const,
  activityLogs: ['user', 'activity-logs'] as const,
} as const;
