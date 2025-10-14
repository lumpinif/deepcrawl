# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo containing a web scraping and crawling service with the following main components:

- **apps/workers/v0/**: Main Cloudflare Worker application providing web scraping and reading APIs
- **apps/workers/auth/**: Authentication worker using Better Auth
- **apps/app/**: Next.js dashboard application for managing the service
- **packages/**: Shared packages including:
  - `@deepcrawl/auth`: Authentication configuration and email templates
  - `@deepcrawl/db-auth`: Auth Database schema and Drizzle ORM setup
  - `@deepcrawl/db-d1`: D1 Database schema and Drizzle ORM setup for Cloudflare D1
  - `@deepcrawl/types`: Shared TypeScript types and schemas (includes metrics types)
  - `@deepcrawl/contracts`: API contract definitions for oRPC
  - `@deepcrawl/ui`: shadcn/ui component library
  - `deepcrawl`: TypeScript SDK for Deepcrawl API

## Common Commands

All commands should be run from the repository root unless otherwise specified.

### Development

```bash
# Start all services in development mode
pnpm dev

# Start dashboard with workers (dashboard + auth + deepcrawl)
cd apps/app && pnpm dev:workers

# Start dashboard with auth worker only
cd apps/app && pnpm dev:auth-worker

# Start deepcrawl worker in development mode
cd apps/workers/v0 && pnpm dev

# Start auth worker in development mode
cd apps/workers/auth && pnpm dev
```

### Building and Deployment

```bash
# Build all services
pnpm build

# Type check all services
pnpm typecheck

# Run all checks (type checking, linting, formatting)
pnpm check

# Deploy deepcrawl worker to production
cd apps/workers/v0 && pnpm deploy
```

### Testing and Quality

```bash
# Run sherif dependency checks
pnpm sherif

# Fix sherif issues automatically (ignores @types/node)
pnpm sherif:fix

# Format and lint deepcrawl worker
cd apps/workers/v0 && pnpm check

# Format and lint dashboard app
cd apps/app && pnpm check

# Run all checks from root (typecheck, lint, format, sherif)
pnpm check

# Clean all build artifacts and node_modules across the monorepo
pnpm clean
```

### OpenAPI and Types

```bash
# Generate OpenAPI YAML for deepcrawl worker
cd apps/workers/v0 && pnpm gen:openapi

# Generate Cloudflare Worker types
cd apps/workers/v0 && pnpm cf-typegen
```

### Database Management

```bash
# Auth Database operations (run from packages/db/db-auth/)
cd packages/db/db-auth

# Generate database migrations
pnpm db:generate

# Push database schema changes
pnpm db:push

# Run database studio
pnpm db:studio

# Full database sync (generate + migrate)
pnpm db:sync

# Production database commands
pnpm db:generate:prod
pnpm db:push:prod
pnpm db:sync:prod

# D1 Database operations (run from packages/db/db-d1/)
cd packages/db/db-d1

# Create new D1 database
pnpm db:create

# Generate D1 database migrations
pnpm db:generate

# Push D1 database schema changes
pnpm db:push

# Run D1 database studio
pnpm db:studio

# Migrate D1 database
pnpm db:migrate

# Full D1 database sync (generate + migrate)
pnpm db:sync
```

### Authentication

```bash
# Generate auth schema (run from packages/auth/)
cd packages/auth

# Generate auth schema for development
pnpm auth:generate

# Email template development
pnpm email:dev
pnpm email:export
```

### SDK Development

```bash
# TypeScript SDK (run from packages/sdks/js-ts/)
cd packages/sdks/js-ts

# Build SDK for distribution
pnpm build

# Watch mode for SDK development
pnpm dev

# Type check SDK
pnpm typecheck

# Clean build artifacts
pnpm clean

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Test SDK locally (create test.ts file)
# Note: test.ts files should use async/await properly
# Wrap code in async function to avoid top-level await errors
tsx src/test.ts
```

## Architecture Overview

### Deepcrawl Worker (apps/workers/v0/)

- **Framework**: Hono.js with Cloudflare Workers
- **API Pattern**: Dual API approach using both oRPC and Hono/Zod-OpenAPI
- **Services**:
  - `ScrapeService`: Web scraping with Puppeteer and Cheerio
  - `HTMLCleaningService`: Content sanitization and processing
  - `MetadataService`: Extract page metadata
  - `LinkService`: Link extraction and normalization
- **Storage**: Cloudflare KV for caching (DEEPCRAWL_V0_READ_STORE, DEEPCRAWL_V0_LINKS_STORE)
- **AI**: Cloudflare AI binding for content processing
- **Metrics**: Performance tracking with configurable reporting for all endpoints

### Key Service Patterns

- **Dual API System**: Both oRPC and OpenAPI/REST share the same business logic through a unified contract system
  - **oRPC**: Type-safe RPC endpoints at `/rpc/*` for SDK consumption
  - **OpenAPI**: RESTful endpoints at `/read`, `/links`, `/docs`, `/openapi` for general API access
- **Context Pattern**: Shared `AppContext` includes Hono context, auth client, service fetchers, user/session data
- **Middleware Stack** (in order):
  1. CORS (`deepCrawlCors`)
  2. Emoji Favicon
  3. Logger
  4. Request ID
  5. Secure Headers
  6. Trailing Slash Trimming
  7. Service Fetcher (for service bindings)
  8. API Key Auth (non-blocking, attempts authentication)
  9. Cookie Auth (fallback for dashboard users)
  10. Require Auth (enforces authentication)
  11. Pretty JSON

### Frontend (apps/app/)

- **Framework**: Next.js 14 with App Router
- **Authentication**: Better Auth with multiple providers
- **UI**: shadcn/ui components with Tailwind CSS
- **State**: TanStack Query for server state management

### Authentication (apps/workers/auth/)

- **Framework**: Hono.js with Better Auth
- **Features**: OAuth providers, passkeys, magic links
- **Database**: Configured for user management
- **Authentication Flow**:
  - **API Key Authentication**: Primary method via `x-api-key` header or Authorization Bearer token
  - **Cookie Authentication**: Fallback for dashboard users
  - **Service Bindings**: Auth worker communicates with main worker via Cloudflare Service Bindings
- **Router Structure**: Auth endpoints organized in `router/auth.ts`

## Development Workflow

1. **Environment Setup**: Each worker has its own `wrangler.jsonc` with environment-specific configurations
2. **Type Safety**: Strict TypeScript configuration across all packages
3. **Monorepo**: Uses pnpm workspaces with Turbo for build orchestration
4. **Code Quality**: Biome for formatting/linting, ESLint for additional rules
5. **Build Tools**: tsup for SDK builds, Turbo for parallel builds across packages

## Key Files and Directories

- `apps/workers/v0/src/app.ts`: Main application entry point
- `apps/workers/v0/src/orpc.ts`: oRPC server configuration
- `apps/workers/v0/src/contract/`: API contract definitions
- `apps/workers/v0/src/services/`: Core business logic
- `apps/workers/v0/src/utils/metrics.ts`: Performance metrics utilities
- `apps/workers/v0/wrangler.jsonc`: Cloudflare Worker configuration
- `apps/app/app/actions/`: Next.js server actions
- `turbo.json`: Monorepo build pipeline configuration

## Environment Variables

Key environment variables are defined in `turbo.json` globalEnv section:

- `BETTER_AUTH_*`: Authentication configuration
- `DATABASE_URL`: Database connection
- `RESEND_API_KEY`: Email service
- OAuth provider credentials (GitHub, Google)
- `NEXT_PUBLIC_USE_AUTH_WORKER`: Enable auth worker for dashboard
- `FROM_EMAIL`: Email sender address

## Metrics and Performance Tracking

The service includes comprehensive metrics tracking for performance monitoring:

### Metrics Configuration

- **Default Behavior**: Metrics are enabled by default (`DEFAULT_METRICS_OPTIONS.enable: true`)
- **Configurable**: Can be disabled per request via `metricsOptions.enable: false`
- **Endpoints**: Available on `/read` and `/links` endpoints
- **Schema**: Defined in `packages/types/src/metrics/types.ts`

### Metrics Data Structure

```typescript
// MetricsSchema provides:
{
  readableDuration: string,    // Human-readable duration (e.g., "0.2s")
  durationMs: number,          // Duration in milliseconds
  startTimeMs: number,         // Start timestamp (Unix ms)
  endTimeMs: number           // End timestamp (Unix ms)
}
```

### Implementation Details

- **Utilities**: `getMetrics()` and `formatDuration()` functions in `apps/workers/v0/src/utils/metrics.ts`
- **Integration**: Conditionally added to response objects based on `metricsOptions.enable`
- **Performance**: Uses `performance.now()` for high-precision timing
- **Response Integration**: Metrics are included in response objects when enabled

### Usage in Processors

Both read and links processors follow the same pattern:

- Check `metricsOptions?.enable` before adding metrics
- Use `getMetrics(startTime, performance.now())` to calculate metrics
- Add metrics to response object: `response.metrics = metrics`

## Code Quality and Formatting

The project uses Biome for code formatting and linting with Ultracite integration:

- **Configuration**: `biome.jsonc` at root level, enhanced by `.claude/CLAUDE.md` rules
- **Formatting**: 2-space indentation, single quotes, trailing commas
- **Linting**: Extended ruleset with accessibility and security rules
- **Import Organization**: Automatic import sorting enabled
- **Ultracite**: AI-friendly code generation with strict type safety and accessibility standards
- **Comprehensive Rules**: 300+ code quality, accessibility, React, TypeScript, and Next.js rules enforced

## Testing

This project uses Vitest for testing the TypeScript SDK. For other parts of the monorepo, manual testing should be done using:

- Development servers (`pnpm dev`)
- OpenAPI documentation endpoints (`/docs`)
- Database studio for data verification (`pnpm db:studio` from packages/db/)
- SDK test files with `tsx` command

### SDK Testing

The TypeScript SDK has a complete test suite using Vitest:

- Unit tests in `packages/sdks/js-ts/src/__tests__/`
- Integration tests available
- Run tests with `pnpm test` from the SDK directory
- Coverage reports available with `pnpm test:coverage`

### SDK Package Details

The TypeScript SDK (`deepcrawl`) provides:

- **Client library** for Deepcrawl API
- **Methods**: `getMarkdown()`, `readUrl()`, `getLinks()`, `extractLinks()`, `getManyLogs()`, `getOneLog()`
- **Built with tsup** for both CommonJS and ESM formats
- **Published to npm** with version management
- **RPC-First Design**: Uses oRPC's RPCLink for efficient communication
- **Universal Runtime Support**: Works in Node.js, browsers, Edge Runtime, and Server Actions
- **Automatic Header Forwarding**: In Next.js Server Actions, automatically extracts auth headers
- **Dedicated Export Paths** for better tree-shaking:
  - `deepcrawl` - Main SDK client (`DeepcrawlApp`)
  - `deepcrawl/types` - All TypeScript types and error classes
  - `deepcrawl/schemas` - All Zod schemas for validation
  - `deepcrawl/utils` - Utility functions (`formatDuration`, `getMetrics`, `getUserMessage`)
- **Custom Error Classes** (import from `deepcrawl/types`):
  - `DeepcrawlError`: Base error class
  - `DeepcrawlAuthError`: Authentication failures
  - `DeepcrawlNetworkError`: Network issues
  - `DeepcrawlReadError`: Read operation errors
  - `DeepcrawlLinksError`: Link extraction errors
  - `DeepcrawlRateLimitError`: Rate limiting errors
  - `DeepcrawlValidationError`: Invalid request parameters
  - `DeepcrawlNotFoundError`: Resource not found
  - `DeepcrawlServerError`: Server-side errors

### SDK Import Patterns

Always use dedicated export paths for better tree-shaking and clearer separation:

```typescript
// SDK Client
import { DeepcrawlApp } from "deepcrawl";

// Types (use 'import type' for type-only imports)
import type { ReadUrlOptions, ReadUrlResponse } from "deepcrawl/types";

// Schemas (for runtime validation)
import { ReadUrlOptionsSchema } from "deepcrawl/schemas";

// Utilities
import { formatDuration, getMetrics } from "deepcrawl/utils";
```

**Never import types, schemas, or utils from the main `'deepcrawl'` package** - always use the dedicated paths.

## Worker Development

### Deepcrawl Worker Development

```bash
# Development with remote Cloudflare environment
cd apps/workers/v0
pnpm dev  # Uses port 8080

# Generate Cloudflare Worker types
pnpm cf-typegen

# Deploy to production (includes checks and type generation)
pnpm deploy
```

### Auth Worker Development

```bash
# Development with remote Cloudflare environment
cd apps/workers/auth
pnpm dev

# Deploy to production
pnpm deploy
```

### Dashboard Development

```bash
# Development with Next.js Turbopack
cd apps/app
pnpm dev

# Development with workers (dashboard + auth + deepcrawl)
pnpm dev:workers

# Development with auth worker only
pnpm dev:auth-worker

# Clean build artifacts
pnpm clean
pnpm clean:node  # Custom script to clean node_modules

# shadcn/ui component management
pnpm ui add button  # Example: add button component
```

## Code Style Guidelines

Based on `.claude/CLAUDE.md` (Ultracite/Biome rules):

- **TypeScript**: Use interfaces over types, avoid enums (use maps instead), avoid `any` type, use `export type`/`import type` for types
- **Programming Style**: Functional and declarative patterns, avoid classes, use arrow functions over function expressions
- **React**: Prefer Server Components over client components, minimal 'use client', wrap client components in Suspense, don't use `<img>` in Next.js (use `next/image`)
- **Variable Naming**: Use descriptive names with auxiliary verbs (isLoading, hasError)
- **UI Framework**: shadcn/ui with Tailwind CSS, mobile-first responsive design
- **Authentication**: Better Auth with unlinkAccount method (requires allowUnlinkingAll config for single accounts)
- **Development Commands**: Never automatically run dev/build commands for the user - they prefer to control when processes start
- **Accessibility**: Strict accessibility rules enforced - proper ARIA usage, semantic HTML, keyboard navigation, include `lang` attribute on html element
- **Code Quality**: Extensive Biome linting rules enforced including no unused variables, proper error handling, consistent formatting, no console statements
- **Error Handling**: Always provide comprehensive error handling with meaningful messages, don't swallow errors
- **Security**: Never hardcode sensitive data like API keys and tokens in code

## Important Notes

- **Node.js**: Requires Node.js >= 20
- **Package Manager**: Uses pnpm@10.15.1 with workspaces (NEVER use npm - this project uses pnpm)
- **Deployment**: Cloudflare Workers for backend services
- **Database**: Dual database setup - Neon PostgreSQL for auth, Cloudflare D1 for data preservation (both with Drizzle ORM)
- **Authentication**: Better Auth with multiple providers (GitHub, Google, passkeys, magic links)
- **UI Components**: shadcn/ui with Tailwind CSS
- **Build System**: Turbo for monorepo orchestration, tsup for SDK builds
- **Code Quality**: Biome for formatting/linting (80 char line width, 2-space indentation), ESLint for additional rules
- **Development Utilities**:
  - Custom logging utilities for development environment (`logDebug`)
  - Markdown linting with markdownlint-cli2
  - Automatic Cloudflare Worker types generation
- **Environment URLs**:
  - Development: `http://localhost:8080` (Deepcrawl Worker)
  - Production: `https://api.deepcrawl.dev`
- **Worker Configuration**:
  - Smart Placement enabled for optimal performance
  - Observability enabled for production monitoring
  - Service bindings for inter-worker communication
- Always avoid using 'any' type assertion whenever possible

## Critical: Avoiding Circular Dependencies in @deepcrawl/types

**NEVER import from barrel exports within the same package!**

Files inside `packages/types/src/` must use relative imports to avoid circular dependencies:

```typescript
// ❌ WRONG - Causes circular dependency runtime errors
import { MetricsSchema } from "@deepcrawl/types/schemas";

// ✅ CORRECT - Use relative imports within the package
import { MetricsSchema } from "../../metrics/schemas";
import { CacheOptionsSchema } from "../../services/cache/schemas";
```

**Why this matters:**

- Barrel exports (`@deepcrawl/types/schemas`) re-export files from within the package
- Importing from the barrel creates circular dependencies during runtime (tsx, node)
- TypeScript compilation and IDE work fine, but runtime execution fails
- External packages (workers, SDK, contracts) SHOULD use barrel exports for convenience

**Rule of thumb:**

- Internal (within `@deepcrawl/types`): Always use relative imports
- External (from other packages): Always use barrel exports (`@deepcrawl/types/schemas`)
