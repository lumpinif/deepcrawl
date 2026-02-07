# Deepcrawl API Worker

Web scraping and reading APIs powered by Cloudflare Workers with enterprise-grade features.

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![Hono.js](https://img.shields.io/badge/Hono.js-Framework-blue.svg)](https://hono.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)

## 🚀 Development

```bash
# Start development server (port 8080)
pnpm dev

# Apply local D1 migrations (required for local Wrangler dev)
pnpm d1-db:migrate:local

# Generate Cloudflare Worker types
pnpm cf-typegen

# Generate OpenAPI specification
pnpm gen:openapi

# Run all checks (lint, format, typecheck)
pnpm check
```

### Local vs Remote Dev

- We default to local Wrangler dev because Better Auth AuthWorker relies on RPC,
  and dev-remote can be unreliable for the local auth worker.
- By default, `DB_V0` uses the remote D1 database (see `wrangler.jsonc` with
  `"remote": true` under `d1_databases`).
- If you use `AUTH_MODE=jwt` or `AUTH_MODE=none`, you can run:

```bash
pnpm dev:remote
```

This runs the worker remotely and also connects to the remote D1 database.

To use a local D1 database instead:

1. Change `wrangler.jsonc` and set `"remote": false` (or remove it) for `DB_V0`.
2. Apply local migrations:

```bash
pnpm d1-db:migrate:local
```

## 🚀 Deployment

```bash
# Deploy to production (includes checks and type generation)
pnpm deploy

# Preview deployment
pnpm preview
```

## ⚡ Features

### **Core Capabilities**

- 🌐 **Web Scraping** - Puppeteer + Cheerio for content extraction
- 🧹 **Content Sanitization** - HTML cleaning and markdown conversion
- 🔗 **Link Processing** - Link extraction, normalization, and relationship mapping
- 📊 **Metadata Extraction** - Page metadata extraction

### **API Architecture**

- 🎯 **Dual API System** - Both oRPC (type-safe RPC) and OpenAPI/REST endpoints
- ⚡ **Performance** - Smart placement and caching with Cloudflare KV
- 🔐 **Authentication** - API key and cookie-based auth with rate limiting
- 📚 **Documentation** - OpenAPI documentation at `/docs`

### **Service Architecture**

- `ScrapeService` - Web scraping with Puppeteer and Cheerio
- `HTMLCleaningService` - Content sanitization and processing
- `MetadataService` - Page metadata extraction
- `LinkService` - Link extraction and normalization
- `ActivityLoggerService` - Activity logging and tracking
- Caching implemented via Cloudflare KV bindings

## 🌍 Production

- **URL**: `https://api.deepcrawl.dev`
- **Documentation**: `https://api.deepcrawl.dev/docs`
- **OpenAPI Spec**: `https://api.deepcrawl.dev/openapi`

## 🛠️ Configuration

Internal reference:

- See `AUTH_MODES_AND_WORKERS.md` for the full auth matrix (AUTH_MODE x auth backend).

The worker is configured via `wrangler.jsonc` with:

- **Smart Placement** - Optimal performance routing
- **Node.js Compatibility** - Full Node.js API support
- **Service Bindings** - Inter-worker communication
- **KV Storage** - Caching and data persistence
- **Custom Domain** - `api.deepcrawl.dev`

### Authentication Modes

Deepcrawl supports multiple authentication modes. Default is `better-auth`.

```bash
# Auth mode: better-auth (default) | jwt | none
AUTH_MODE=better-auth
```

- `better-auth` (default): API key + cookie auth via Better Auth.
- `jwt`: Verify JWT tokens from `Authorization: Bearer <token>`.
- `none`: No authentication, all operations are open. Use with caution.

### Activity Logs

Logs are enabled by default across environments.

This is configured in `wrangler.jsonc`:

```jsonc
"vars": {
  "ENABLE_ACTIVITY_LOGS": true
}
```

Set this to `false` to skip writing activity logs.

### JWT Configuration

Required when `AUTH_MODE=jwt`:

```bash
JWT_SECRET=your_jwt_secret
JWT_ISSUER=deepcrawl            # optional
JWT_AUDIENCE=deepcrawl-api      # optional
```

JWT payload expectations:
- `sub` is required and maps to `user.id` and `session.userId`
- Optional fields: `email`, `name`, `picture`, `email_verified`, `exp`

Notes on issuer/audience:
- `iss` (issuer) identifies who minted the token.
- `aud` (audience) identifies which service the token is intended for.
- If unset, they are not validated. If set, tokens must match to be accepted.

Generate a JWT secret:

1. Cross-platform (Node.js):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. macOS/Linux (OpenSSL):
```bash
openssl rand -hex 32
```

### JWT Example (Node.js)

Use the simplest and most common library: `jsonwebtoken`.

```bash
pnpm add jsonwebtoken
```

```ts
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  {
    sub: 'user_123',
    email: 'alice@example.com',
    name: 'Alice',
  },
  process.env.JWT_SECRET as string,
  {
    expiresIn: '24h',
    issuer: 'deepcrawl',
    audience: 'deepcrawl-api',
  },
);

// Send as: Authorization: Bearer <token>
```

### JWT Quick Mint (CLI)

If you only deploy the API worker and want a quick token for simple auth,
use the built-in script in this repo:

```bash
# From the repo root
JWT_SECRET=your_jwt_secret pnpm jwt:mint
```

This is an interactive Node.js script (not Bash), so it works on macOS and
Windows. It will prompt you for required fields if you don’t pass flags.
If you leave the JWT secret blank, the script can generate one for you.
It can also write the secret into local env files for you.

You can also pass flags to skip prompts:

```bash
pnpm jwt:mint -- --sub user_123 --email alice@example.com --expires-in 24
```

Write the secret into env files (optional):

```bash
pnpm jwt:mint -- --write-dev-vars
pnpm jwt:mint -- --write-dev-vars-production
```

Required inputs:
- `JWT_SECRET` (env var or prompt)
- `sub` (user id)

Optional inputs:
- `email`
- `name`
- `issuer` (`JWT_ISSUER`)
- `audience` (`JWT_AUDIENCE`)
- `expires-in` (hours, default 24)

The command prints a JWT you can attach as:

```
Authorization: Bearer <token>
```

## 🔌 API Endpoints

### **oRPC Endpoints** (Type-safe)

- `POST /rpc/read` - Read and process URLs
- `POST /rpc/links` - Extract and analyze links

### **REST Endpoints** (OpenAPI)

- `GET /read` - Read URL content
- `GET /links` - Extract links from URL
- `GET /docs` - Interactive API documentation
- `GET /openapi` - OpenAPI specification
