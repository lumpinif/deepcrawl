# Docs

This folder defines the MVP scope and UX for the `create-deepcrawl` CLI.

Current focus:

- **V0 API Worker only** (Cloudflare Workers)
- Authentication: `none` or `jwt`
- A single guided flow that creates required Cloudflare resources, writes config,
  and deploys in one pass (no extra questions after deployment starts).
- After deployment the CLI shows the Worker URL, a docs link, and the two blocked
  secret files (`apps/workers/v0/.dev.vars` and
  `apps/workers/v0/.dev.vars.production`) that store `JWT_SECRET` plus a short
  recap of what was provisioned.
- It then prompts `Try your API now?`, auto-mints a 15-minute token when JWT is
  required, runs a quick test, and prints status, preview, and a copyable `curl`
  command without persisting the response.

Deployment targets:

- Available now: `V0 API Worker only`
- Supporting soon: `Dashboard app + API`
- Supporting soon: `Fullstack app + auth + API`
- Supporting soon: `Custom domains and routes`

Files:

- `v0/required.md`: Required inputs and prerequisites.
- `v0/optional.md`: Optional prompts and feature flags.
- `v0/prompt-flow.md`: The exact prompt order and branching rules.
