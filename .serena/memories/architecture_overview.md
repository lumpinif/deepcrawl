# Architecture Overview - DeepCrawl

## System Architecture
DeepCrawl is a monorepo-based web scraping service with a dual API approach:

### Core Components
1. **DeepCrawl Worker** (apps/workers/v0/): Main scraping service
2. **Auth Worker** (apps/workers/auth/): Authentication service  
3. **Dashboard** (apps/app/): Next.js frontend
4. **Shared Packages**: Common utilities and types

## API Design Pattern - Dual System
### oRPC Endpoints (`/rpc/*`)
- Type-safe RPC for SDK consumption
- Efficient communication via RPCLink
- Used by TypeScript SDK

### REST/OpenAPI Endpoints
- `/read`, `/links`, `/docs`, `/openapi`
- Standard HTTP APIs for general access
- Auto-generated OpenAPI documentation

Both systems share the same business logic through unified contracts.

## Authentication Flow
1. **Primary**: API Key via `x-api-key` header or Authorization Bearer
2. **Fallback**: Cookie authentication for dashboard users
3. **Special Key**: `USE_COOKIE_AUTH_INSTEAD_OF_API_KEY` bypasses API key for dashboard
4. **Service Bindings**: Inter-worker communication

## Middleware Stack (DeepCrawl Worker)
1. CORS (deepCrawlCors)
2. Emoji Favicon
3. Logger
4. Request ID
5. Secure Headers  
6. Trailing Slash Trimming
7. Service Fetcher (service bindings)
8. API Key Auth (non-blocking)
9. Cookie Auth (fallback)
10. Require Auth (enforcement)
11. Pretty JSON

## Context Pattern
Shared `AppContext` includes:
- Hono context
- Auth client
- Service fetchers
- User/session data

## Storage & Processing
- **KV Stores**: DEEPCRAWL_V0_READ_STORE, DEEPCRAWL_V0_LINKS_STORE
- **AI Binding**: Cloudflare AI for content processing
- **Scraping**: Puppeteer + Cheerio for content extraction
- **Databases**: PostgreSQL (auth) + D1 (data) with Drizzle ORM

## Build & Deployment
- **Monorepo**: Turbo orchestration with pnpm workspaces
- **Workers**: Cloudflare Workers with Smart Placement
- **Observability**: Production monitoring enabled
- **SDK**: Universal runtime support (Node.js, browsers, Edge Runtime)

## Key Files
- `apps/workers/v0/src/app.ts`: Main application entry
- `apps/workers/v0/src/orpc.ts`: oRPC server config
- `apps/workers/v0/src/contract/`: API contracts
- `apps/workers/v0/src/services/`: Business logic
- `turbo.json`: Build pipeline configuration