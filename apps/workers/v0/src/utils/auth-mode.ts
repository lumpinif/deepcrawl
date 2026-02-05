export type AuthMode = 'better-auth' | 'jwt' | 'none';

const AUTH_MODE_VALUES: Record<AuthMode, true> = {
  'better-auth': true,
  jwt: true,
  none: true,
};

export function resolveAuthMode(value?: string | null): AuthMode {
  if (!value) {
    return 'better-auth';
  }

  const normalized = value.trim().toLowerCase();
  if (normalized in AUTH_MODE_VALUES) {
    return normalized as AuthMode;
  }

  return 'better-auth';
}
