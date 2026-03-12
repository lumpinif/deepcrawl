# V0 MVP: Optional Prompts

This document lists optional prompts for the v0-only MVP flow.

Principle:

- Keep the v0-only flow runnable with near-zero decisions.
- Optional prompts must have safe defaults and must not block deployment.

## Optional Prompts

### JWT Claims Validation (only if `authMode=jwt`)

- `jwtIssuer` (maps to Wrangler var `JWT_ISSUER`)
  - Default: empty (do not validate `iss`)
- `jwtAudience` (maps to Wrangler var `JWT_AUDIENCE`)
  - Default: empty (do not validate `aud`)

### Activity Logs

- `enableActivityLogs` (Wrangler var `ENABLE_ACTIVITY_LOGS`)
  - Default: `true`

### API Rate Limiting (Upstash)

Status:

- Optional for MVP. Should default to **disabled**.

Prompt (optional):

- `enableApiRateLimit` (Wrangler var `ENABLE_API_RATE_LIMIT`)
  - Default: `false`

If enabled:

- Require Upstash credentials (Wrangler secrets):
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`

If credentials are missing, the runtime is fail-open, but the CLI should treat
this as a configuration error if the user explicitly enabled rate limiting.

## Out of Scope (V0 MVP)

- Custom domains and routes (`Supporting soon`)
- Dashboard + API deployments (`Supporting soon`)
- Fullstack app + auth + API deployments (`Supporting soon`)
- Better Auth / OAuth provider setup (`Supporting soon`)

## Quick test (post deployment)

- The CLI asks `Try your API now?` once the Worker is live.
- If the user agrees, it jumps into the quick test flow (`Read a page` or
  `Extract links`, `https://example.com` by default) and automatically mints a
  15-minute JWT when `authMode=jwt`.
- The quick test prints status, a truncated preview, and a `curl` command with
  the temporary token, but never writes the response to disk.
