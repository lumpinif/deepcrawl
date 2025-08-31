# Project Overview - DeepCrawl

## Purpose
DeepCrawl is a web scraping and crawling service that provides APIs for extracting content, metadata, and links from web pages. It's designed as a comprehensive solution for web data extraction with both REST and RPC APIs.

## Tech Stack
- **Backend**: Cloudflare Workers with Hono.js framework
- **Frontend**: Next.js 14 with App Router
- **Authentication**: Better Auth with multiple providers (GitHub, Google, passkeys, magic links)  
- **Databases**: Dual setup - Neon PostgreSQL for auth, Cloudflare D1 for data
- **ORM**: Drizzle ORM for both databases
- **UI Framework**: shadcn/ui with Tailwind CSS
- **Build System**: Turbo monorepo with pnpm workspaces
- **Code Quality**: Biome for formatting/linting
- **API Pattern**: Dual approach with oRPC (type-safe) and OpenAPI/REST
- **Storage**: Cloudflare KV for caching
- **AI**: Cloudflare AI binding for content processing
- **Web Scraping**: Puppeteer and Cheerio
- **Testing**: Vitest for SDK testing

## Monorepo Structure
- **apps/workers/v0/**: Main DeepCrawl worker (scraping APIs)
- **apps/workers/auth/**: Authentication worker
- **apps/app/**: Next.js dashboard application
- **packages/**: Shared libraries and utilities
  - auth, db-auth, db-d1, types, contracts, ui, deepcrawl SDK

## Key Services
- ScrapeService: Web scraping with Puppeteer and Cheerio
- HTMLCleaningService: Content sanitization and processing
- MetadataService: Extract page metadata
- LinkService: Link extraction and normalization

## Development Environment
- Node.js >= 20 required
- pnpm@10.15.0 (NEVER use npm)
- Windows development environment
- Uses Cloudflare Workers runtime