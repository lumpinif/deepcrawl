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

- Custom domains and routes
- AuthWorker provisioning
- Dashboard (Next.js) provisioning
- Better Auth / OAuth provider setup

