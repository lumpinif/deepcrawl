# DeepCrawl API Worker

Cloudflare Worker that provides web scraping and reading APIs.

## Development

```bash
# Install dependencies and start development server
pnpm install
pnpm dev
```

## Deployment  

```bash
# Deploy to Cloudflare Workers
pnpm deploy
```

## Features

- Web scraping with Puppeteer and Cheerio
- Content sanitization and markdown conversion
- Link extraction and normalization
- Metadata extraction
- Dual API: oRPC + OpenAPI/REST
- Cloudflare KV caching
