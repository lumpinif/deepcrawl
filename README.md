# Deepcrawl

> **100% free and open-source Firecrawl alternative with better performance and flexibility.**

Deepcrawl is an open-source agents-oriented web page context extraction platform. It extracts cleaned markdown of page content, agent-favoured links tree and page metadata that LLMs can digest with minimal token cost to reduce context switching and hallucination.

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## Why Deepcrawl

- **Compress messy web pages** into structured markdown that agents and humans can read
- **Map every link in a domain** so workflows understand site topology before they browse
- **Type-safe, production-ready APIs and SDKs** that feel native inside agent frameworks like `ai-sdk`

## How It Works

- **Crawling pipeline:** Cloudflare Workers handle fetching, normalization, and link graph generation for each domain or URL
- **Rendering outputs:** Engines convert HTML into markdown tuned for LLM prompts, keeping context rich while trimming noise
- **Developer toolchain:** The monorepo hosts shared packages, database modules, and scripts that keep the full stack consistent

## ⚡ Quick Start

```bash
# Install dependencies
pnpm install

# Start all services in development
pnpm dev

# Start dashboard with workers (dashboard + auth + deepcrawl)
cd apps/app && pnpm dev:workers
```

## 🏗️ Architecture

Deepcrawl is a comprehensive monorepo featuring:

### 🎯 **Core Services**

- **🌐 Deepcrawl Worker** (`apps/workers/v0/`) - High-performance web scraping with dual API (oRPC + REST)
- **🔐 Auth Worker** (`apps/workers/auth/`) - Authentication with Better Auth, OAuth, and passkeys
- **📊 Dashboard** (`apps/app/`) - Next.js management interface with TanStack Query

### 📦 **Shared Packages**

- **🛠️ TypeScript SDK** (`packages/sdks/js-ts/`) - Universal client library with comprehensive error handling
- **🗄️ Database Packages** - Dual setup with PostgreSQL (auth) and Cloudflare D1 (data preservation)
- **🎨 UI Components** (`@deepcrawl/ui`) - shadcn/ui component library
- **📋 Types & Contracts** - Shared TypeScript definitions and API contracts

## 🚀 Development

### **Individual Services**

```bash
# Dashboard only (Next.js with Turbopack)
cd apps/app && pnpm dev

# Deepcrawl worker only (port 8080)
cd apps/workers/v0 && pnpm dev

# Auth worker only
cd apps/workers/auth && pnpm dev
```

### **Combined Development**

```bash
# Dashboard + auth worker only
cd apps/app && pnpm dev:auth-worker

# Dashboard + all workers
cd apps/app && pnpm dev:workers
```

### **Build & Quality**

```bash
# Build everything
pnpm build

# Type check all services
pnpm typecheck

# Run all checks (lint, format, typecheck, sherif)
pnpm check

# Fix dependency issues automatically
pnpm sherif:fix
```

## 🎨 UI Development

```bash
# Add shadcn/ui components to the dashboard
cd apps/app && pnpm ui add button
```

Components are shared from the `@deepcrawl/ui` package:

```tsx
import { Button } from "@deepcrawl/ui/components/ui/button";
```

## 🗄️ Database Management

### **Auth Database (PostgreSQL)**

```bash
cd packages/db/db-auth
pnpm db:push      # Push schema changes
pnpm db:studio    # Open Drizzle Studio
pnpm db:sync      # Generate + migrate
```

### **D1 Database (Cloudflare)**

```bash
cd packages/db/db-d1
pnpm db:create    # Create new D1 database
pnpm db:push      # Push schema changes
pnpm db:studio    # Open Drizzle Studio
```

## 👥 Who Uses Deepcrawl

- **Developers:** Consume the APIs directly or integrate with the fully typed JavaScript/TypeScript SDKs for fast agent workflows
- **Analysts & teams:** Use the Next.js 15 dashboard to run crawls, explore the API playground, review logs, and manage API keys without writing code

## 🏢 Deployment

Deepcrawl ships with everything you need to self-host: deploy the dashboard to Vercel, the workers to Cloudflare, and you have a complete system without paid dependencies. Fork it, extend it, or plug it into your existing stack—the licenses and tooling encourage customization.

```bash
# Deploy Deepcrawl worker to production
cd apps/workers/v0 && pnpm deploy

# Deploy auth worker to production
cd apps/workers/auth && pnpm deploy
```

## 🔧 Environment Setup

Each worker requires its own environment configuration. Check `wrangler.jsonc` files in worker directories for specific requirements.

## 📚 More Information

- 📖 **Documentation**: Check individual service README files and `/apps/app/content/docs`
- 🛠️ **SDK Usage**: See `packages/sdks/js-ts/README.md`
- 🏗️ **Architecture**: Review `CLAUDE.md` for detailed technical guidance
- 📊 **API Docs**: Available at `/docs` endpoint on workers

## License

MIT License - Open Source. Open Code.
