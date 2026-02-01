# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed with `pnpm` and `turbo`.
- Apps:
  - Next.js dashboard in `apps/app`
  - Cloudflare workers in `apps/workers/auth` and `apps/workers/v0`
- Packages:
  - SDK: `packages/sdks/js-ts`
  - Database code: `packages/db/*`
  - Shared UI and configs: `packages/ui`, `packages/eslint-config`, `packages/typescript-config`, `packages/types`
- Utility scripts live in `scripts/`.
- Feature tests live next to source or under `src/__tests__/`.

## Build, Test, and Development Commands
- `pnpm install` — install dependencies (Node >= 20).
- `pnpm dev` — run the whole workspace.
- `pnpm -C apps/app dev` — run dashboard only.
- `pnpm -C apps/app dev:workers` — run dashboard + workers.
- `pnpm build` — production build across workspace.
- `pnpm typecheck` — strict TypeScript validation.
- `pnpm check` — format, lint, type, and dependency audits.
- `pnpm -C packages/sdks/js-ts test` — run SDK tests.
- `pnpm test:coverage` — SDK coverage run.

## Coding Style & Naming Conventions
- Formatter: Biome (2-space indent, single quotes, semicolons, trailing commas, max width 80).
- React components: PascalCase filenames.
- Hooks: `use-*.ts`.
- Other files: kebab-case preferred.
- Respect shared TS configs in `packages/typescript-config` and resolve lint warnings before commit.

## Testing Guidelines
- Framework: Vitest (SDK).
- Test names: `*.test.ts` next to source or in `src/__tests__/`.
- Add coverage for client logic and shared types when changing APIs.

## Commit & Pull Request Guidelines
- Conventional commits like `app:feat`, `pkg:ui:ref`, `workers:v0:chore`.
- Keep subjects imperative and <= 72 chars; reference issues when relevant (e.g., `#123`).
- PRs should include a concise summary, linked issue, UI screenshots for dashboard changes, and confirmation that `pnpm check` succeeded.

## Security & Configuration Tips
- Never commit secrets. Use `apps/app/.env.example`, worker `.dev.vars.*`, and Wrangler `wrangler.jsonc`.
- Run DB scripts from `packages/db/db-auth` (e.g., `pnpm db:sync`), not manual SQL.
- Review Wrangler config before deploying with:
  - `pnpm -C apps/workers/v0 deploy`
  - `pnpm -C apps/workers/auth deploy`
