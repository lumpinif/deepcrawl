# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed with `pnpm` and `turbo`; Next.js dashboard in `apps/app`, Cloudflare workers in `apps/workers/auth` and `apps/workers/v0`.
- Shared packages under `packages/` include the SDK at `packages/sdks/js-ts` and database code in `packages/db/*`; place feature tests alongside source.
- Utility scripts live in `scripts/`; workspace configs (`turbo.json`, `biome.jsonc`, `pnpm-workspace.yaml`) sit at the root.

## Build, Test, and Development Commands
- `pnpm install` — install dependencies (Node >= 20).
- `pnpm dev` — run the whole workspace; focus with `pnpm -C apps/app dev` or `pnpm -C apps/app dev:workers`.
- `pnpm build` / `pnpm typecheck` — production build and strict TypeScript validation.
- `pnpm check` — aggregate format, lint, type, and dependency audits.
- `pnpm -C packages/sdks/js-ts test` or `pnpm test:coverage` — run Vitest for the SDK.

## Coding Style & Naming Conventions
- Format with Biome: 2-space indent, single quotes, semicolons, trailing commas, max width 80.
- React components use PascalCase filenames; hooks follow `use-*.ts`; other files prefer kebab-case.
- Respect shared TypeScript configs in `packages/typescript-config`; resolve lint warnings before commit.

## Testing Guidelines
- Vitest powers the SDK; cover client logic and critical type behavior.
- Name tests `*.test.ts` beside source or under `src/__tests__/`.
- Run suites locally before pushing; extend coverage when altering API surface or shared types.

## Commit & Pull Request Guidelines
- Use conventional commits such as `app:feat`, `pkg:ui:ref`, `workers:v0:chore`; keep subjects imperative and <= 72 chars.
- Reference issues (for example `#123`) and capture follow-up tasks in the body when needed.
- PRs need a concise summary, linked issue, UI screenshots for dashboard changes, and confirmation that `pnpm check` succeeded.

## Security & Configuration Tips
- Never commit secrets; rely on `apps/app/.env.example`, worker `.dev.vars.*`, and Wrangler `wrangler.jsonc`.
- Run database scripts from `packages/db/db-auth` (e.g., `pnpm db:sync`) instead of manual SQL.
- Review Wrangler config before deploying with `pnpm -C apps/workers/v0 deploy` or `pnpm -C apps/workers/auth deploy`.
