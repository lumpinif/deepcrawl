import type { EnvTarget, EnvVarGroup } from './env';

export type WranglerTarget = Extract<EnvTarget, 'worker-auth' | 'worker-v0'>;

export type WranglerVarType = 'string' | 'boolean' | 'number';

export type WranglerVar = {
  key: string;
  type: WranglerVarType;
  group: EnvVarGroup;
  targets: readonly WranglerTarget[];
  description?: string;
  localDefault?: string | boolean | number;
  productionDefault?: string | boolean | number;
};

// Wrangler "vars" are visible in `wrangler.jsonc` and can be typed (boolean/number)
// which keeps `wrangler types` output accurate. Keep secrets out of this list.
export const WRANGLER_VARS: readonly WranglerVar[] = [
  {
    key: 'NEXT_PUBLIC_APP_URL',
    type: 'string',
    group: 'App',
    targets: ['worker-auth', 'worker-v0'],
    description: 'Public app URL (used for navigation and auth callbacks).',
    localDefault: 'http://localhost:3000',
    productionDefault: 'https://deepcrawl.dev',
  },
  {
    key: 'BETTER_AUTH_URL',
    type: 'string',
    group: 'Auth',
    targets: ['worker-auth', 'worker-v0'],
    description: 'Auth base URL.',
    localDefault: 'http://localhost:8787',
    productionDefault: 'https://auth.deepcrawl.dev',
  },
  {
    key: 'AUTH_MODE',
    type: 'string',
    group: 'Auth',
    targets: ['worker-v0'],
    description: 'Auth mode: better-auth | jwt | none.',
    localDefault: 'better-auth',
    productionDefault: 'better-auth',
  },
  {
    key: 'API_URL',
    type: 'string',
    group: 'Workers',
    targets: ['worker-v0'],
    description: 'Public API base URL (used for links and OpenAPI metadata).',
    localDefault: 'http://localhost:8080',
    productionDefault: 'https://api.deepcrawl.dev',
  },
  {
    key: 'ENABLE_ACTIVITY_LOGS',
    type: 'boolean',
    group: 'Logs',
    targets: ['worker-v0'],
    description: 'Enable activity logs (non-secret toggle).',
    localDefault: true,
    productionDefault: true,
  },
  {
    key: 'WORKER_NODE_ENV',
    type: 'string',
    group: 'Workers',
    targets: ['worker-v0'],
    description: 'Node env for the API worker.',
    localDefault: 'development',
    productionDefault: 'production',
  },
  {
    key: 'AUTH_WORKER_NODE_ENV',
    type: 'string',
    group: 'Workers',
    targets: ['worker-auth'],
    description: 'Node env for the auth worker.',
    localDefault: 'development',
    productionDefault: 'production',
  },
  {
    key: 'JWT_ISSUER',
    type: 'string',
    group: 'JWT',
    targets: ['worker-v0'],
    description: 'JWT issuer (optional).',
  },
  {
    key: 'JWT_AUDIENCE',
    type: 'string',
    group: 'JWT',
    targets: ['worker-v0'],
    description: 'JWT audience (optional).',
  },
  {
    key: 'GITHUB_CLIENT_ID',
    type: 'string',
    group: 'OAuth',
    targets: ['worker-auth', 'worker-v0'],
    description: 'GitHub OAuth client id.',
  },
  {
    key: 'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
    type: 'string',
    group: 'OAuth',
    targets: ['worker-auth', 'worker-v0'],
    description: 'Google OAuth client id (public).',
  },
  {
    key: 'FROM_EMAIL',
    type: 'string',
    group: 'Email',
    targets: ['worker-auth'],
    description: 'From email address.',
  },
] as const;

export function getWranglerVarsForTarget(
  target: WranglerTarget,
): WranglerVar[] {
  return WRANGLER_VARS.filter((v) => v.targets.includes(target));
}
