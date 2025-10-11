# Deepcrawl API Worker

Web scraping and reading APIs powered by Cloudflare Workers with enterprise-grade features.

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![Hono.js](https://img.shields.io/badge/Hono.js-Framework-blue.svg)](https://hono.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)

## 🚀 Development

```bash
# Start development server (port 8080)
pnpm dev

# Generate Cloudflare Worker types
pnpm cf-typegen

# Generate OpenAPI specification
pnpm gen:openapi

# Run all checks (lint, format, typecheck)
pnpm check
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

The worker is configured via `wrangler.jsonc` with:

- **Smart Placement** - Optimal performance routing
- **Node.js Compatibility** - Full Node.js API support
- **Service Bindings** - Inter-worker communication
- **KV Storage** - Caching and data persistence
- **Custom Domain** - `api.deepcrawl.dev`

## 🔌 API Endpoints

### **oRPC Endpoints** (Type-safe)

- `POST /rpc/read` - Read and process URLs
- `POST /rpc/links` - Extract and analyze links

### **REST Endpoints** (OpenAPI)

- `GET /read` - Read URL content
- `GET /links` - Extract links from URL
- `GET /docs` - Interactive API documentation
- `GET /openapi` - OpenAPI specification
