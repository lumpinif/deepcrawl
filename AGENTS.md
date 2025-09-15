 # Repository Guidelines

 ## Project Structure & Modules
 - Monorepo managed by `pnpm` and `turbo`.
 - Apps:
   - `apps/app` — Next.js dashboard (UI + docs).
   - `apps/workers/auth` — Auth Cloudflare Worker.
   - `apps/workers/v0` — Deepcrawl API Worker (oRPC + REST).
 - Packages:
   - `packages/sdks/js-ts` — TypeScript SDK (Vitest tests).
   - `packages/db/*` — Drizzle schemas and scripts (Postgres auth, D1 data).
   - `packages/*` — shared types, UI, ESLint, TS config.
 - Utilities: `scripts/`, root `turbo.json`, `biome.jsonc`, `pnpm-workspace.yaml`.

 ## Build, Test, and Dev
 - Install: `pnpm install` (Node >= 20).
 - Dev (all): `pnpm dev`.
 - Dev (focused):
   - Dashboard: `cd apps/app && pnpm dev`.
   - Workers: `cd apps/app && pnpm dev:workers` or run each in its folder.
 - Build all: `pnpm build`.
 - Typecheck all: `pnpm typecheck`.
 - Repo checks: `pnpm check` (format, lint, typecheck, deps).
 - SDK tests: `cd packages/sdks/js-ts && pnpm test` (or `pnpm test:coverage`).
 - Deploy workers: `cd apps/workers/v0 && pnpm deploy`, `cd apps/workers/auth && pnpm deploy`.

 ## Coding Style & Naming
 - Formatting via Biome: 2-space indent, single quotes, semicolons, trailing commas; max width 80.
 - Linting: Biome + per‑package ESLint configs.
 - TypeScript: strict mode (`packages/typescript-config`).
 - Names: files `kebab-case.ts`, React components `PascalCase.tsx`, hooks `use-*.ts`.

 ## Testing Guidelines
 - Framework: Vitest in `packages/sdks/js-ts`.
 - Test files: `*.test.ts` next to source or under `src/__tests__/`.
 - Aim for meaningful unit coverage of client behavior and types; add integration tests where API stubs exist.
 - Run locally: `pnpm -C packages/sdks/js-ts test`.

 ## Commit & PR Guidelines
 - Conventional style with scopes seen in history: `app:feat`, `app:fix`, `pkg:ui:ref`, `workers:v0:chore`.
 - Subject in imperative, <= 72 chars; optional body for details; reference issues (`#123`).
 - PRs must include: clear summary, linked issue, screenshots for UI changes, and confirmation that `pnpm check` passes.

 ## Security & Config
 - Never commit secrets. Use `apps/app/.env.example` and Workers `.dev.vars.*` plus Wrangler `wrangler.jsonc`.
 - For DB tasks, use scripts in `packages/db/db-auth` (e.g., `pnpm db:sync`).
