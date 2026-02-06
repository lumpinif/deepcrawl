export type EnvTarget =
  | 'dashboard'
  | 'worker-auth'
  | 'worker-v0'
  | 'db-auth'
  | 'db-d1';

export type EnvVarGroup =
  | 'App'
  | 'Auth'
  | 'OAuth'
  | 'Email'
  | 'Workers'
  | 'JWT'
  | 'Logs'
  | 'Cloudflare'
  | 'Upstash'
  | 'Turbo'
  | 'SDK';

export type EnvVar = {
  key: string;
  group: EnvVarGroup;
  targets: readonly EnvTarget[];
  description?: string;
  example?: string;
  secret?: boolean;
};

// Single source of truth for env keys used across the monorepo.
// Used by local tooling and future deployment automation (create-deepcrawl).
export const ENV_VARS: readonly EnvVar[] = [
  {
    key: 'NEXT_PUBLIC_APP_URL',
    group: 'App',
    targets: ['dashboard', 'worker-auth'],
    description: 'Public app URL (used for navigation and auth callbacks).',
    example: 'http://localhost:3000',
  },
  {
    key: 'NEXT_PUBLIC_DEEPCRAWL_API_URL',
    group: 'App',
    targets: ['dashboard'],
    description: 'Public API base URL for the dashboard server to call.',
    example: 'https://api.deepcrawl.dev',
  },

  {
    key: 'NEXT_PUBLIC_USE_AUTH_WORKER',
    group: 'Auth',
    targets: ['dashboard'],
    description:
      "Set to 'false' to use integrated Next.js auth routes instead of the auth worker.",
    example: 'true',
  },
  {
    key: 'BETTER_AUTH_URL',
    group: 'Auth',
    targets: ['dashboard', 'worker-auth', 'worker-v0'],
    description:
      'Auth base URL. Points to auth worker or to Next.js /api/auth depending on mode.',
    example: 'http://localhost:8787',
  },
  {
    key: 'BETTER_AUTH_SECRET',
    group: 'Auth',
    targets: ['dashboard', 'worker-auth', 'worker-v0'],
    description: 'Better Auth secret.',
    example: '',
    secret: true,
  },
  {
    key: 'DATABASE_URL',
    group: 'Auth',
    targets: ['dashboard', 'worker-auth', 'worker-v0', 'db-auth'],
    description: 'Postgres connection string (Neon, etc).',
    example: '',
    secret: true,
  },

  {
    key: 'AUTH_MODE',
    group: 'Auth',
    targets: ['dashboard', 'worker-v0'],
    description: 'Auth mode: better-auth | jwt | none.',
    example: 'better-auth',
  },
  {
    key: 'AUTH_JWT_TOKEN',
    group: 'JWT',
    targets: ['dashboard'],
    description: 'JWT token used by the dashboard server when AUTH_MODE=jwt.',
    example: '',
    secret: true,
  },
  {
    key: 'JWT_SECRET',
    group: 'JWT',
    targets: ['worker-v0'],
    description: 'JWT secret used by the API worker when AUTH_MODE=jwt.',
    example: '',
    secret: true,
  },
  {
    key: 'JWT_ISSUER',
    group: 'JWT',
    targets: ['worker-v0'],
    description: 'JWT issuer (optional).',
    example: '',
  },
  {
    key: 'JWT_AUDIENCE',
    group: 'JWT',
    targets: ['worker-v0'],
    description: 'JWT audience (optional).',
    example: '',
  },

  {
    key: 'GITHUB_CLIENT_ID',
    group: 'OAuth',
    targets: ['dashboard', 'worker-auth', 'worker-v0'],
    description: 'GitHub OAuth client id.',
    example: '',
  },
  {
    key: 'GITHUB_CLIENT_SECRET',
    group: 'OAuth',
    targets: ['dashboard', 'worker-auth', 'worker-v0'],
    description: 'GitHub OAuth client secret.',
    example: '',
    secret: true,
  },
  {
    key: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
    group: 'OAuth',
    targets: ['dashboard', 'worker-auth', 'worker-v0'],
    description: 'Google OAuth client id (public).',
    example: '',
  },
  {
    key: 'GOOGLE_CLIENT_SECRET',
    group: 'OAuth',
    targets: ['dashboard', 'worker-auth', 'worker-v0'],
    description: 'Google OAuth client secret.',
    example: '',
    secret: true,
  },

  {
    key: 'RESEND_API_KEY',
    group: 'Email',
    targets: ['dashboard', 'worker-auth', 'worker-v0'],
    description: 'Resend API key (optional).',
    example: '',
    secret: true,
  },
  {
    key: 'FROM_EMAIL',
    group: 'Email',
    targets: ['dashboard', 'worker-auth'],
    description: 'From email, e.g. "Deepcrawl <noreply@deepcrawl.dev>".',
    example: '',
  },

  {
    key: 'ENABLE_ACTIVITY_LOGS',
    group: 'Logs',
    targets: ['worker-v0'],
    description: 'Enable activity log persistence.',
    example: 'true',
  },

  {
    key: 'UPSTASH_REDIS_REST_URL',
    group: 'Upstash',
    targets: ['worker-v0'],
    description: 'Upstash Redis REST URL (used by rate limiting).',
    example: '****',
    secret: true,
  },
  {
    key: 'UPSTASH_REDIS_REST_TOKEN',
    group: 'Upstash',
    targets: ['worker-v0'],
    description: 'Upstash Redis REST token (used by rate limiting).',
    example: '****',
    secret: true,
  },

  {
    key: 'CLOUDFLARE_ACCOUNT_ID',
    group: 'Cloudflare',
    targets: ['worker-v0', 'db-d1'],
    description: 'Cloudflare account id (for D1 Drizzle CLI).',
    example: '',
    secret: true,
  },
  {
    key: 'CLOUDFLARE_DATABASE_ID',
    group: 'Cloudflare',
    targets: ['worker-v0', 'db-d1'],
    description: 'Cloudflare D1 database id (for D1 Drizzle CLI).',
    example: '',
    secret: true,
  },
  {
    key: 'CLOUDFLARE_D1_TOKEN',
    group: 'Cloudflare',
    targets: ['worker-v0', 'db-d1'],
    description: 'Cloudflare API token for D1 Drizzle CLI.',
    example: '',
    secret: true,
  },

  {
    key: 'TURBO_TOKEN',
    group: 'Turbo',
    targets: ['dashboard'],
    description: 'Turbo remote cache token (CI only).',
    example: '',
    secret: true,
  },

  {
    key: 'DEEPCRAWL_API_KEY',
    group: 'SDK',
    targets: ['dashboard'],
    description: 'SDK API key used by examples (server-only).',
    example: 'dc-your-generated-key',
    secret: true,
  },
  {
    key: 'DEEPCRAWL_API_URL',
    group: 'SDK',
    targets: ['dashboard'],
    description: 'SDK API base URL override (optional).',
    example: '',
  },
] as const;

export function getEnvVarsForTarget(target: EnvTarget): EnvVar[] {
  return ENV_VARS.filter((v) => v.targets.includes(target));
}

export function listEnvKeysForTarget(target: EnvTarget): string[] {
  return getEnvVarsForTarget(target).map((v) => v.key);
}
