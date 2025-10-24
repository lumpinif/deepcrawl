# Contributing to Deepcrawl

Thank you for contributing! This guide covers the essential workflows and conventions.

## Prerequisites

- **Node.js** >= 20
- **pnpm** 10.19.0
- **Git** latest version

## Quick Setup

```bash
git clone https://github.com/YOUR_USERNAME/deepcrawl.git
cd deepcrawl
pnpm install
git checkout -b feature/your-feature-name
```

## Development Commands

```bash
pnpm check                        # Run all quality checks
pnpm typecheck                    # Type check only

cd apps/app && pnpm dev:workers   # Dashboard + workers (api + auth)
cd apps/workers/v0 && pnpm dev    # V0 worker only
cd packages/sdks/js-ts && pnpm test  # Run SDK tests
```

**💡 Tip**: Run `pnpm check` from **any scope** (package/app) or from the **root** to catch type errors and linting issues early. This runs Biome formatter/linter and TypeScript type checking, helping you debug before committing.

```bash
# From root - checks entire workspace
pnpm check

# From any package - checks that package
cd apps/workers/v0 && pnpm check
cd packages/sdks/js-ts && pnpm check
```

## Git Workflow

### Automated Quality Gates

```text
git add .
  ↓
git commit -m "(scope):(category): message"
  ↓ [Pre-Commit] - lint-staged (Biome + ESLint on staged files)
  ↓
git push
  ↓ [Pre-Push] - Branch sync, lint, typecheck, smart SDK tests
  ↓
GitHub Actions - Validate, Deploy, Release
```

**Pre-commit** ([`.husky/pre-commit`](.husky/pre-commit)): Runs `lint-staged` on staged files only
**Pre-push** ([`.husky/pre-push`](.husky/pre-push)): Checks branch sync, runs lint/typecheck, conditionally runs SDK tests

**Skip hooks**: `git push --no-verify` or add `[skip ci]` to commit message

### Commit Message Format

**Format**: `(scope):(category): message`

**Quick Reference**:

| Scope            | Example                             |
| ---------------- | ----------------------------------- |
| `app`            | `app:fix: fix login validation`     |
| `v0` or `wks:v0` | `v0:feat: add rate limiting`        |
| `wks:auth`       | `wks:auth:ref: refactor session`    |
| `pkg:ui`         | `pkg:ui:feat: add toast component`  |
| `pkg:sdk-ts`     | `pkg:sdk-ts:fix: resolve types`     |
| `pkg:types`      | `pkg:types:feat: add metrics types` |
| `pkg:contracts`  | `pkg:contracts:feat: add contract`  |
| `pkg:db-auth`    | `pkg:db-auth:chore: update schema`  |
| `chore`          | `chore: update dependencies`        |
| `ci`             | `ci: add workflow`                  |
| `docs`           | `docs: update README`               |

**Categories**: `feat`, `fix`, `ref`, `chore`, `docs`, `test`, `perf`, `style`, `build`

**Examples**:

- `app:fix: resolve form validation error`
- `v0:feat: add new scraping endpoint`
- `pkg:sdk-ts:ref: improve error handling`
- `chore: bump dependencies to latest`

## GitHub Actions

### [Validate](.github/workflows/validate.yml)

**Trigger**: Push/PR to `main`
**Steps**: Biome, ESLint, Typecheck, SDK tests, SDK build

### [Auth Worker Deploy](.github/workflows/deploy-auth-worker.yml)

**Trigger**: Push to `main` with changes to `packages/auth/**` or `apps/workers/auth/**`
**Steps**: DB sync, deploy to Cloudflare

### [V0 Worker Deploy](.github/workflows/deploy-v0-worker.yml)

**Trigger**: Push to `main` with changes to `apps/workers/v0/**`
**Steps**: Deploy to Cloudflare

### [Release](.github/workflows/release.yml)

**Trigger**: Push to `main` with changesets
**Steps**: Build, test, create release PR or publish to npm

## Critical Requirements

### SDK Changes Require Changesets

**If you modify any of these packages, you MUST create a changeset:**

- `packages/sdks/js-ts` (SDK)
- `packages/types` (Types)
- `packages/contracts` (Contracts)

```bash
# Create a changeset
pnpm changeset

# Follow the prompts:
# 1. Select packages that changed
# 2. Choose bump type (patch/minor/major)
# 3. Write a clear summary
# 4. Commit the changeset file

git add .changeset/
git commit -m "pkg:sdk-ts:feat: add new feature + changeset"
```

The [release workflow](.github/workflows/release.yml) will automatically publish to npm.

### Auth Package Database Migrations

**If you modify `packages/auth` and it requires database schema changes:**

```bash
cd packages/db/db-auth

# Generate migration from schema changes
pnpm db:generate

# Apply migration to local database
pnpm db:push

# Commit the migration files
git add drizzle/
git commit -m "pkg:auth:feat: add new auth field + migration"
```

Production migrations run automatically in the [Auth Worker Deploy workflow](.github/workflows/deploy-auth-worker.yml).

## Pull Request Process

1. Sync with upstream: `git fetch upstream && git rebase upstream/main`
2. Run quality checks: `pnpm check`
3. **If SDK/types/contracts changed**: Create changeset (`pnpm changeset`)
4. **If auth schema changed**: Generate and commit migrations
5. Push to your fork: `git push origin feature/your-feature-name`
6. Open PR with clear description and link related issues (`Fixes #123`)
7. Ensure all CI checks pass

## Code Style

- **Formatting**: Biome with 2-space indentation, single quotes, 80 char line width
- **TypeScript**: Use interfaces, avoid `any`, use `export type` for types
- **React**: Prefer Server Components, minimal `'use client'`, use `next/image`
- **Accessibility**: Include `lang` attribute, meaningful alt text, semantic HTML

See [CLAUDE.md](CLAUDE.md) for comprehensive style guidelines and architecture details.

## Testing

```bash
cd packages/sdks/js-ts
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
```

Manual testing: Use `pnpm dev`, OpenAPI docs at `/docs`, and `pnpm db:studio`

## Resources

- [CLAUDE.md](CLAUDE.md) - Technical guidelines and architecture
- [README.md](README.md) - Project overview
- [GitHub Workflows](.github/workflows/) - CI/CD configurations

## Questions?

Open a GitHub Discussion or ask in existing issues.
