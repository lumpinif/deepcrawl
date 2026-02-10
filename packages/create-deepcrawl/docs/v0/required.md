# V0 MVP: Required Configuration

This document describes what is required for the **minimal v0-only** deployment
flow.

## Preconditions (User Environment)

- Node.js `>= 20`
- `pnpm`
- `git`
- Cloudflare Wrangler CLI installed (`wrangler`)
- Cloudflare login completed (`wrangler whoami` succeeds)

## CLI Inputs (Required)

The CLI must collect the following before it starts provisioning/deploying:

- `projectName`
  - Used for local folder name and as a prefix for Cloudflare resource names.
- `authMode`
  - Allowed: `none` | `jwt`

If `authMode=jwt`:

- `jwtSecret`
  - HS256 secret used by the v0 worker to verify JWTs.
  - The CLI should offer to generate a secure random value.

## Cloudflare Resources (Required)

The v0 worker requires these Cloudflare resources:

- D1 database binding: `DB_V0`
- KV namespaces:
  - `DEEPCRAWL_V0_LINKS_STORE`
  - `DEEPCRAWL_V0_READ_STORE`

The CLI is responsible for:

1. Creating the resources (if missing).
2. Wiring their IDs into `apps/workers/v0/wrangler.jsonc`.

## Required Worker Vars / Secrets

The minimal v0-only runtime needs:

- `AUTH_MODE` (Wrangler var): `none` or `jwt`
- If `AUTH_MODE=jwt`:
  - `JWT_SECRET` (Wrangler secret)

Recommended (not strictly required for MVP correctness, but should be set):

- `WORKER_NODE_ENV` (Wrangler var): `production`
- `API_URL` (Wrangler var): deployed URL or a stable public URL
- `NEXT_PUBLIC_APP_URL` (Wrangler var): used for CORS trusted origins behavior

## Template Patch (Required)

For v0-only deployments, the CLI must ensure the v0 worker does **not** require
an auth worker service binding at deploy time.

Specifically, the CLI must remove `services` from:

- root of `apps/workers/v0/wrangler.jsonc`
- `env.production` inside `apps/workers/v0/wrangler.jsonc`

(The repo already has a helper to strip services in JSONC.)

