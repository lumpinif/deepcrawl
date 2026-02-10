# V0 MVP: Prompt Flow

This is the exact prompt order for the **v0-only** minimal deployment flow.

## High-Level Rules

- Ask all questions **before** provisioning/deployment starts.
- Once provisioning starts, do not ask new questions.
- Prefer defaults that make the flow succeed without optional services.

## Prompt Order

1. **Project name**
   - Prompt: `Project name`
   - Value: `projectName`
   - Validation:
     - non-empty
     - kebab-case recommended (CLI can normalize)

2. **Auth mode**
   - Prompt: `Authentication mode (none / jwt)`
   - Value: `authMode`
   - Allowed: `none`, `jwt`

3. **JWT configuration** (only if `authMode=jwt`)
   1. Prompt: `JWT secret (leave blank to generate)`
      - Value: `jwtSecret`
      - If blank: generate a random 32-byte (or longer) secret (hex or base64).
   2. Prompt: `JWT issuer (optional)`
      - Value: `jwtIssuer`
      - Default: empty
   3. Prompt: `JWT audience (optional)`
      - Value: `jwtAudience`
      - Default: empty

4. **Activity logs**
   - Prompt: `Enable activity logs?`
   - Value: `enableActivityLogs`
   - Default: `true`

5. **API rate limit (Upstash)** (optional prompt, can be skipped in MVP)
   - Prompt: `Enable API rate limiting (Upstash)?`
   - Value: `enableApiRateLimit`
   - Default: `false`
   - If `true`:
     - Prompt: `Upstash REST URL`
     - Prompt: `Upstash REST token`

6. **Confirmation (summary)**
   - Show a summary of:
     - resources that will be created (D1 + 2 KV namespaces)
     - vars/secrets that will be set
     - target deployment: Cloudflare v0 worker
   - Prompt: `Proceed? (yes/no)`

## Execution Steps (after confirmation)

1. Clone the template repo/branch into `./<projectName>`
2. Apply v0-only patches:
   - Remove `services` from `apps/workers/v0/wrangler.jsonc` (root + production)
3. Provision Cloudflare resources:
   - Create D1 database
   - Create two KV namespaces
   - Write binding IDs into `apps/workers/v0/wrangler.jsonc`
4. Apply vars/secrets:
   - Write Wrangler vars (`AUTH_MODE`, `ENABLE_ACTIVITY_LOGS`, etc.)
   - Write Wrangler secrets (`JWT_SECRET`, optional Upstash secrets)
5. Deploy:
   - `wrangler deploy` for v0 worker (production)

