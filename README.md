# DeepCrawl

A web scraping and reading service built with Cloudflare Workers and Next.js.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start all services in development
pnpm dev

# Start only dashboard + auth services
pnpm dev:dashboard
```

## What's Inside

- **Dashboard**: Next.js app at `apps/app/` for managing the service
- **API Worker**: Cloudflare Worker at `apps/workers/v0/` for web scraping
- **Auth Worker**: Cloudflare Worker at `apps/workers/auth/` for authentication
- **SDK**: TypeScript client library at `packages/sdks/js-ts/`

## Development

```bash
# Start dashboard only
cd apps/app && pnpm dev

# Start API worker only  
cd apps/workers/v0 && pnpm dev

# Start auth worker only
cd apps/workers/auth && pnpm dev

# Build everything
pnpm build

# Run all checks (lint, format, typecheck)
pnpm check
```

## Adding UI Components

```bash
# Add shadcn/ui components to the dashboard
cd apps/app && pnpm ui add button
```

Components are shared from `@deepcrawl/ui` package:

```tsx
import { Button } from "@deepcrawl/ui/components/ui/button";
```
