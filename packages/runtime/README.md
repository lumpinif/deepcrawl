# @deepcrawl/runtime

Centralized runtime configuration for the Deepcrawl monorepo.

This package is intentionally small and boring:

- A single source of truth for env keys (an env manifest).
- Tiny helpers for common runtime config parsing.

It exists to reduce drift across apps/workers, make local development easier,
and give future automation (e.g. `create-deepcrawl`) an authoritative list of
what to ask users for and where to inject it.

## What's Inside

### 1) Env Manifest

File: `packages/runtime/src/env.ts`

Exports:

- `ENV_VARS`: the full env manifest (keys, descriptions, example values, targets).
- `getEnvVarsForTarget(target)`: filters env vars by a runtime target.
- `listEnvKeysForTarget(target)`: convenience wrapper returning keys only.

Targets are meant to match how the repo actually runs:

- `dashboard` (Next.js app)
- `worker-auth` (Cloudflare auth worker)
- `worker-v0` (Cloudflare API worker)
- `db-auth` (Drizzle/Better Auth CLI for auth DB)
- `db-d1` (Drizzle CLI for D1 DB)

### 2) Auth Mode Helper

File: `packages/runtime/src/auth-mode.ts`

Exports:

- `AuthMode`: `'better-auth' | 'jwt' | 'none'`
- `resolveAuthMode(value)`: normalizes and validates a raw string

This is shared by:

- Dashboard server logic (Node/Next.js)
- Workers logic (Cloudflare runtime)

## Common Usage

### Use `resolveAuthMode()` in Node or Workers

```ts
import { resolveAuthMode } from '@deepcrawl/runtime/auth-mode';

const authMode = resolveAuthMode(process.env.AUTH_MODE);
// => 'better-auth' | 'jwt' | 'none'
```

### Get env keys required for a specific target

```ts
import { getEnvVarsForTarget } from '@deepcrawl/runtime/env';

const workerVars = getEnvVarsForTarget('worker-v0');
// You can render prompts or generate docs from this list.
```

## Local Development Workflows (Repo-Level)

This package is used by repo scripts (not by end users directly).

### Generate example env files from the manifest

Command:

```sh
pnpm env:generate
```

It writes/updates:

- `apps/app/.env.example`
- `apps/workers/auth/.dev.vars.example`
- `apps/workers/v0/.dev.vars.example`
- `env/.env.example` (single source template for local dev)

### Sync a single local env source into per-app/per-worker files

Start from the generated template:

- `env/.env.example`

Copy it to a single local source file (gitignored):

- `env/.env`

Then run:

```sh
pnpm env:sync:local
```

It writes/updates:

- `apps/app/.env.development.local`
- `apps/workers/auth/.dev.vars`
- `apps/workers/v0/.dev.vars`

This removes the need to copy/paste the same env keys into multiple places.

## Notes & Constraints

- This package does not "load env". Loading is platform-specific (Next.js,
  Wrangler, CI providers). This package defines keys and provides small helpers.
- Secrets are marked in the manifest (so future automation can treat them
  differently), but it's still your responsibility to keep secret values out of
  git.
- Example values are documentation aids. Production values should be injected by
  the hosting platform (Vercel/Cloudflare/etc).
