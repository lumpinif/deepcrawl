# V0 MVP: Prompt Flow

This is the exact prompt order for the **v0-only** minimal deployment flow.

## High-Level Rules

- Ask all questions **before** provisioning/deployment starts.
- Once provisioning starts, do not ask new questions.
- Prefer defaults that make the flow succeed without optional services.
- Explain the project folder in plain English before asking for it.
- If a target path is passed on the command line, skip the folder questions.

## Prompt Order

1. **Deployment target**
   - Prompt: `What would you like to deploy?`
   - Value: `deploymentTarget`
   - Show these options in the same select:
     - `V0 API Worker only (Available now)`
     - `Dashboard app + API (Supporting soon)`
     - `Fullstack app + auth + API (Supporting soon)`
     - `Custom domains and routes (Supporting soon)`
   - Allowed now:
     - `v0-api-worker`
   - Supporting soon:
     - shown dim in the CLI
     - not selectable

2. **Project name**
   - Prompt: `Project name`
   - Value: `projectName`
   - Validation:
     - non-empty
     - kebab-case recommended (CLI can normalize)

3. **Project folder**
   - Show a short guide card first:
     - `We'll create one new folder for your project.`
     - `Folder name: the new project folder.`
     - `Create in: the folder where it should go.`
     - `Example: my-app + .. = ../my-app`
   - Prompt: `Create in`
   - Value: `parentDirectory`
   - Default: `.`
   - Meaning:
     - this is the folder where the new project folder will be created

4. **Auth mode**
   - Prompt: `How should this API handle auth?`
   - Value: `authMode`
   - Allowed: `jwt`, `none`
   - Options:
     - `JWT`
     - `No auth`

5. **JWT configuration** (only if `authMode=jwt`)
   1. Prompt: `JWT secret`
      - Placeholder: `Leave blank to generate one`
      - Value: `jwtSecret`
      - If blank: generate a random 32-byte (or longer) secret (hex or base64).
   2. Prompt: `JWT issuer (optional)`
      - Value: `jwtIssuer`
      - Default: empty
   3. Prompt: `JWT audience (optional)`
      - Value: `jwtAudience`
      - Default: empty

6. **Activity logs**
   - Prompt: `Turn on activity logs?`
   - Value: `enableActivityLogs`
   - Default: `true`

7. **API rate limit (Upstash)** (optional prompt, can be skipped in MVP)
   - Prompt: `Enable API rate limiting (Upstash)?`
   - Value: `enableApiRateLimit`
   - Default: `false`
   - If `true`:
     - Prompt: `Upstash REST URL`
     - Prompt: `Upstash REST token`

8. **Confirmation (summary)**
   - Show a summary of:
     - the final project folder that will be created
     - resources that will be created (D1 + 2 KV namespaces)
     - target deployment: Cloudflare v0 worker
   - Prompt: `Deploy now?`

## Execution Steps (after confirmation)

1. Clone the template repo/branch into `<parentDirectory>/<projectName>`
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

## Success card and quick test

- The final note highlights the deployed API URL, a link to this document, and
  the two gitignored files (`apps/workers/v0/.dev.vars` and
  `apps/workers/v0/.dev.vars.production`) that store `JWT_SECRET`.
- It then prompts `Try your API now?`. Choosing `Yes` runs a quick test flow
  (`Read a page` or `Extract links`, target URL) that automatically mints a
  15-minute HS256 token when JWT auth is active.
- The quick test displays the HTTP status, a truncated pretty-printed preview
  of the response, and a ready-to-copy `curl` command that embeds the temporary
  token. No response data is written to disk.
