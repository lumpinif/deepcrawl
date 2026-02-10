# Docs

This folder defines the MVP scope and UX for the `create-deepcrawl` CLI.

Current focus:

- **V0 API Worker only** (Cloudflare Workers)
- Authentication: `none` or `jwt`
- A single guided flow that creates required Cloudflare resources, writes config,
  and deploys in one pass (no extra questions after deployment starts).

Files:

- `v0/required.md`: Required inputs and prerequisites.
- `v0/optional.md`: Optional prompts and feature flags.
- `v0/prompt-flow.md`: The exact prompt order and branching rules.

