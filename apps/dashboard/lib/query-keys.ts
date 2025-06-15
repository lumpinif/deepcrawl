// Query keys for consistency across server and client components
export const userQueryKeys = {
  session: ['user', 'session'] as const,
  listSessions: ['user', 'list-sessions'] as const,
  deviceSessions: ['user', 'device-sessions'] as const,
  organization: ['user', 'organization'] as const,
  passkeys: ['user', 'passkeys'] as const,
  linkedAccounts: ['user', 'linked-accounts'] as const,
} as const;
