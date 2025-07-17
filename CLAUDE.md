# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo containing a web scraping and crawling service with the following main components:

- **apps/workers/deepcrawl-v0/**: Main Cloudflare Worker application providing web scraping and reading APIs
- **apps/workers/auth/**: Authentication worker using Better Auth
- **apps/app/**: Next.js dashboard application for managing the service
- **packages/**: Shared packages including:
  - `@deepcrawl/auth`: Authentication configuration and email templates
  - `@deepcrawl/db`: Database schema and Drizzle ORM setup
  - `@deepcrawl/types`: Shared TypeScript types and schemas
  - `@deepcrawl/contracts`: API contract definitions for oRPC
  - `@deepcrawl/ui`: shadcn/ui component library
  - `@deepcrawl-sdk/ts`: TypeScript SDK for DeepCrawl API

## Common Commands

All commands should be run from the repository root unless otherwise specified.

### Development
```bash
# Start all services in development mode
pnpm dev

# Start only dashboard and auth services
pnpm dev:dashboard

# Start deepcrawl worker in development mode
cd apps/workers/deepcrawl-v0 && pnpm dev

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
cd apps/workers/deepcrawl-v0 && pnpm deploy
```

### Testing and Quality
```bash
# Run sherif dependency checks
pnpm sherif

# Fix sherif issues automatically (ignores @types/node)
pnpm sherif:fix

# Format and lint deepcrawl worker
cd apps/workers/deepcrawl-v0 && pnpm check

# Format and lint dashboard app
cd apps/app && pnpm check

# Run all checks from root (typecheck, lint, format, sherif)
pnpm check
```

### OpenAPI and Types
```bash
# Generate OpenAPI YAML for deepcrawl worker
cd apps/workers/deepcrawl-v0 && pnpm gen:openapi

# Generate Cloudflare Worker types
cd apps/workers/deepcrawl-v0 && pnpm cf-typegen
```

### Database Management
```bash
# Database operations (run from packages/db/)
cd packages/db

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
# TypeScript SDK (run from packages/sdks/typescript/)
cd packages/sdks/typescript

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

### DeepCrawl Worker (apps/workers/deepcrawl-v0/)
- **Framework**: Hono.js with Cloudflare Workers
- **API Pattern**: Dual API approach using both oRPC and Hono/Zod-OpenAPI
- **Services**:
  - `ScrapeService`: Web scraping with Puppeteer and Cheerio
  - `HTMLCleaning`: Content cleaning and processing
  - `MetadataService`: Extract page metadata
  - `LinkService`: Link extraction and processing
- **Storage**: Cloudflare KV for caching (READ_STORE, LINKS_STORE)
- **AI**: Cloudflare AI binding for content processing

### Key Service Patterns
- **oRPC**: Type-safe RPC endpoints at `/rpc/*`
- **OpenAPI**: RESTful endpoints at `/read`, `/links`, `/docs`, `/openapi`
- **Context**: Shared context pattern for dependency injection
- **Middleware**: CORS, rate limiting, validation, error handling

### Frontend (apps/app/)
- **Framework**: Next.js 14 with App Router
- **Authentication**: Better Auth with multiple providers
- **UI**: shadcn/ui components with Tailwind CSS
- **State**: TanStack Query for server state management

### Authentication (apps/workers/auth/)
- **Framework**: Hono.js with Better Auth
- **Features**: OAuth providers, passkeys, magic links
- **Database**: Configured for user management

## Development Workflow

1. **Environment Setup**: Each worker has its own `wrangler.jsonc` with environment-specific configurations
2. **Type Safety**: Strict TypeScript configuration across all packages
3. **Monorepo**: Uses pnpm workspaces with Turbo for build orchestration
4. **Code Quality**: Biome for formatting/linting, ESLint for additional rules
5. **Build Tools**: tsup for SDK builds, Turbo for parallel builds across packages

## Key Files and Directories

- `apps/workers/deepcrawl-v0/src/app.ts`: Main application entry point
- `apps/workers/deepcrawl-v0/src/orpc.ts`: oRPC server configuration
- `apps/workers/deepcrawl-v0/src/contract/`: API contract definitions
- `apps/workers/deepcrawl-v0/src/services/`: Core business logic
- `apps/workers/deepcrawl-v0/wrangler.jsonc`: Cloudflare Worker configuration
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

## Code Quality and Formatting

The project uses Biome for code formatting and linting:
- **Configuration**: `biome.jsonc` at root level
- **Formatting**: 2-space indentation, single quotes, trailing commas
- **Linting**: Extended ruleset with accessibility and security rules
- **Import Organization**: Automatic import sorting enabled

## Testing

This project uses Vitest for testing the TypeScript SDK. For other parts of the monorepo, manual testing should be done using:
- Development servers (`pnpm dev`)
- OpenAPI documentation endpoints (`/docs`)
- Database studio for data verification (`pnpm db:studio` from packages/db/)
- SDK test files with `tsx` command

### SDK Testing
The TypeScript SDK has a complete test suite using Vitest:
- Unit tests in `packages/sdks/typescript/src/__tests__/`
- Integration tests available
- Run tests with `pnpm test` from the SDK directory
- Coverage reports available with `pnpm test:coverage`

### SDK Package Details
The TypeScript SDK (`@deepcrawl-sdk/ts`) provides:
- Client library for DeepCrawl API
- Methods: `getMarkdown()`, `readUrl()`, `getLinks()`, `extractLinks()`
- Built with tsup for both CommonJS and ESM formats
- Published to npm with version management

## Worker Development

### DeepCrawl Worker Development
```bash
# Development with remote Cloudflare environment
cd apps/workers/deepcrawl-v0
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

## Important Notes

- **Node.js**: Requires Node.js >= 20
- **Package Manager**: Uses pnpm@10.12.4 with workspaces
- **Deployment**: Cloudflare Workers for backend services
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with multiple providers (GitHub, Google, passkeys, magic links)
- **UI Components**: shadcn/ui with Tailwind CSS
- **Build System**: Turbo for monorepo orchestration, tsup for SDK builds
- **Code Quality**: Biome for formatting/linting (80 char line width, 2-space indentation)