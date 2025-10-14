# Deepcrawl SDK

TypeScript SDK for the Deepcrawl API - Web scraping and crawling with comprehensive error handling.

[![npm version](https://badge.fury.io/js/deepcrawl.svg)](https://www.npmjs.com/package/deepcrawl)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## ⚡ **Why Deepcrawl SDK?**

- 🏗️ **oRPC-Powered**: Built on oRPC framework for type-safe RPC
- 🔒 **Type-Safe**: End-to-end TypeScript with error handling
- 🖥️ **Server-Side Only**: Designed for Node.js, Cloudflare Workers, and Next.js Server Actions
- 🪶 **Lightweight**: Minimal bundle size with tree-shaking support
- 🛡️ **Error Handling**: Comprehensive, typed errors with context
- 🔄 **Retry Logic**: Built-in exponential backoff for transient failures
- ⚡ **Connection Pooling**: Automatic HTTP connection reuse (Node.js)

## 📦 **Installation**

```bash
npm install deepcrawl
# or
yarn add deepcrawl
# or
pnpm add deepcrawl
```

## 🚀 **Quick Start**

```typescript
import { DeepcrawlApp } from 'deepcrawl';

const deepcrawl = new DeepcrawlApp({
  apiKey: process.env.DEEPCRAWL_API_KEY
});

const result = await deepcrawl.readUrl('https://example.com');
console.log(result.markdown);
```

## 📦 **Package Exports**

The SDK uses dedicated export paths for better tree-shaking and organization:

### **Main Export (SDK Client)**

```typescript
import { DeepcrawlApp } from 'deepcrawl';
```

### **Types Export**

```typescript
import type {
  // Configuration
  DeepcrawlConfig,

  // API Types
  ReadUrlOptions,
  ReadUrlResponse,
  GetMarkdownOptions,
  GetMarkdownResponse,
  ExtractLinksOptions,
  ExtractLinksResponse,
  GetLinksOptions,
  GetLinksResponse,

  // Activity Logs
  ActivityLogEntry,
  GetManyLogsOptions,
  GetManyLogsResponse,
  GetOneLogOptions,

  // Metadata & Metrics
  Metadata,
  MetricsOptions,
  Metrics,

  // Links
  LinksTree,
  LinkItem,
  SocialMediaLink,

  // Errors
  DeepcrawlError,
  DeepcrawlReadError,
  DeepcrawlLinksError,
  DeepcrawlRateLimitError,
  DeepcrawlAuthError,
  DeepcrawlValidationError,
  DeepcrawlNotFoundError,
  DeepcrawlServerError,
  DeepcrawlNetworkError,
} from 'deepcrawl/types';
```

### **Schemas Export**

```typescript
import {
  // Request Schemas
  ReadUrlOptionsSchema,
  GetMarkdownOptionsSchema,
  ExtractLinksOptionsSchema,
  GetLinksOptionsSchema,
  GetManyLogsOptionsSchema,
  GetOneLogOptionsSchema,

  // Response Schemas
  ReadUrlResponseSchema,
  GetMarkdownResponseSchema,
  ExtractLinksResponseSchema,
  GetLinksResponseSchema,
  GetManyLogsResponseSchema,

  // Metadata & Metrics
  MetadataSchema,
  MetricsOptionsSchema,
  MetricsSchema,

  // Links
  LinksTreeSchema,

  // services
  CacheOptionsSchema
} from 'deepcrawl/schemas';
```

### **Utilities Export**

```typescript
import {
  // Zod schema helper
  OptionalBoolWithDefault,

  // Pagination normalization
  normalizeGetManyLogsPagination
} from 'deepcrawl/types/utils';

// Example: Create optional boolean schema with default
const schema = OptionalBoolWithDefault(true);

// Example: Normalize pagination input
const normalized = normalizeGetManyLogsPagination({ limit: 150, offset: -5 });
// Returns: { limit: 100, offset: 0 } (clamped to valid ranges)
```

## 📖 **API Methods**

### **readUrl(url, options?)**

Extract clean content and metadata from any URL.

```typescript
import { DeepcrawlApp } from 'deepcrawl';
import type { ReadUrlOptions } from 'deepcrawl/types';

const deepcrawl = new DeepcrawlApp({ apiKey: process.env.DEEPCRAWL_API_KEY });

const result = await deepcrawl.readUrl('https://example.com', {
  metadata: true,
  markdown: true,
  cleanedHtml: true,
  metricsOptions: { enabled: true }
});

console.log(result.markdown);
console.log(result.metadata?.title);
console.log(result.metrics?.readableDuration);
```

### **getMarkdown(url, options?)**

Simplified method to get just markdown content.

```typescript
import { DeepcrawlApp } from 'deepcrawl';

const deepcrawl = new DeepcrawlApp({ apiKey: process.env.DEEPCRAWL_API_KEY });

const result = await deepcrawl.getMarkdown('https://example.com', {
  metricsOptions: { enable: true }
});

console.log(result.markdown);
```

### **extractLinks(url, options?)**

Extract all links from a page with powerful filtering options.

```typescript
import { DeepcrawlApp } from 'deepcrawl';
import type { ExtractLinksOptions } from 'deepcrawl/types';

const deepcrawl = new DeepcrawlApp({ apiKey: process.env.DEEPCRAWL_API_KEY });

const result = await deepcrawl.extractLinks('https://example.com', {
  includeInternal: true,
  includeExternal: false,
  includeEmails: false,
  includePhoneNumbers: false,
  includeSocialMedia: false,
  metricsOptions: { enable: true }
});

console.log(result.tree.internal);
console.log(result.tree.socialMedia);
```

### **getManyLogs(options?)**

Retrieve activity logs with paginated results and filtering.

```typescript
import { DeepcrawlApp } from 'deepcrawl';
import type { GetManyLogsOptions } from 'deepcrawl/types';

const deepcrawl = new DeepcrawlApp({ apiKey: process.env.DEEPCRAWL_API_KEY });

const result = await deepcrawl.getManyLogs({
  limit: 50,
  offset: 0,
  path: 'read-getMarkdown',
  success: true,
  startDate: '2025-01-01T00:00:00Z',
  endDate: '2025-12-31T23:59:59Z',
  orderBy: 'requestTimestamp',
  orderDir: 'desc'
});

console.log(result.logs);
console.log(result.meta.hasMore);
```

### **getOneLog(options)**

Get a single activity log entry by ID.

```typescript
import { DeepcrawlApp } from 'deepcrawl';
import type { GetOneLogOptions } from 'deepcrawl/types';

const deepcrawl = new DeepcrawlApp({ apiKey: process.env.DEEPCRAWL_API_KEY });

const log = await deepcrawl.getOneLog({ id: 'request-id-123' });

console.log(log.path);
console.log(log.response);
```

## 🌟 **Real-World Usage Examples**

### **E-commerce Product Monitoring**

```typescript
import { DeepcrawlApp } from 'deepcrawl';
import type { ReadUrlOptions } from 'deepcrawl/types';

const deepcrawl = new DeepcrawlApp({ apiKey: process.env.DEEPCRAWL_API_KEY });

async function monitorProduct(productUrl: string) {
  try {
    const result = await deepcrawl.readUrl(productUrl, {
      metadata: true,
      cleanedHtml: true
    });

    return {
      title: result.metadata?.title,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    if (error.isRateLimit?.()) {
      console.log(`Rate limited. Retry after ${error.retryAfter}s`);
      await new Promise(r => setTimeout(r, error.retryAfter * 1000));
      return monitorProduct(productUrl);
    }
    throw error;
  }
}
```

### **Content Aggregation Pipeline**

```typescript
import { DeepcrawlApp } from 'deepcrawl';
import type { ReadUrlResponse } from 'deepcrawl/types';

const deepcrawl = new DeepcrawlApp({ apiKey: process.env.DEEPCRAWL_API_KEY });

async function aggregateArticles(urls: string[]) {
  const results = await Promise.allSettled(
    urls.map(url => deepcrawl.readUrl(url, {
      metadata: true,
      markdown: true
    }))
  );

  return results.map((result, index) => ({
    url: urls[index],
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason.message : null
  }));
}
```

### **Next.js Server Actions**

```typescript
// app/actions/scrape.ts
'use server'

import { DeepcrawlApp } from 'deepcrawl';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function scrapeUrlAction(url: string) {
  const deepcrawl = new DeepcrawlApp({
    apiKey: process.env.DEEPCRAWL_API_KEY,
    headers: await headers(),
  });

  try {
    const result = await deepcrawl.readUrl(url, {
      metadata: true,
      markdown: true,
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      data: {
        title: result.metadata?.title,
        content: result.markdown,
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message,
        retryable: error.isRateLimit?.() || error.isNetwork?.(),
      }
    };
  }
}
```

### **React Hook with Error Handling**

```typescript
import { useState, useCallback } from 'react';
import { DeepcrawlApp } from 'deepcrawl';
import type { ReadUrlResponse } from 'deepcrawl/types';

export function useScraping(apiKey: string) {
  const [data, setData] = useState<ReadUrlResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deepcrawl = new DeepcrawlApp({ apiKey });

  const scrape = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await deepcrawl.readUrl(url, { metadata: true });
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [deepcrawl]);

  return { data, loading, error, scrape };
}
```

### **Activity Logging with Server Actions**

```typescript
// app/actions/logs.ts
'use server';

import { DeepcrawlApp } from 'deepcrawl';
import type { GetManyLogsResponse } from 'deepcrawl/types';

const deepcrawl = new DeepcrawlApp({ apiKey: process.env.DEEPCRAWL_API_KEY });

export async function getActivityLogs() {
  try {
    const logs = await deepcrawl.getManyLogs({
      limit: 50,
      offset: 0
    });
    return { success: true, data: logs };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch logs'
    };
  }
}
```

## 🛡️ **Error Handling**

### **Error Classes**

```typescript
import type {
  DeepcrawlError,
  DeepcrawlReadError,
  DeepcrawlLinksError,
  DeepcrawlRateLimitError,
  DeepcrawlAuthError,
  DeepcrawlValidationError,
  DeepcrawlNotFoundError,
  DeepcrawlServerError,
  DeepcrawlNetworkError,
} from 'deepcrawl/types';
```

### **Try/Catch Pattern**

```typescript
import { DeepcrawlApp } from 'deepcrawl';

const deepcrawl = new DeepcrawlApp({ apiKey: process.env.DEEPCRAWL_API_KEY });

try {
  const result = await deepcrawl.readUrl(url);
} catch (error) {
  if (error.isRateLimit?.()) {
    console.log(`Retry after ${error.retryAfter}s`);
  } else if (error.isRead?.()) {
    console.log(`Failed to read: ${error.message}`);
  }
}
```

### **Instance Type Checking**

```typescript
import { DeepcrawlApp } from 'deepcrawl';

const deepcrawl = new DeepcrawlApp({ apiKey: process.env.DEEPCRAWL_API_KEY });

try {
  const result = await deepcrawl.readUrl(url);
} catch (error) {
  // Check error type using instance methods
  if (error.isAuth?.()) {
    console.log('Authentication failed');
  } else if (error.isValidation?.()) {
    console.log('Invalid request parameters');
  }
}
```

### **Error Properties**

All errors include:

- `code: string` - oRPC error code
- `status: number` - HTTP status
- `message: string` - User-friendly error message
- `data: any` - Raw error data from API

Rate limit errors include:

- `retryAfter: number` - Seconds to wait
- `operation: string` - What operation was rate limited

Read/Links errors include:

- `targetUrl: string` - URL that failed
- `success: false` - Always false for errors

## 🔧 **Configuration**

```typescript
import { DeepcrawlApp } from 'deepcrawl';
import type { DeepcrawlConfig } from 'deepcrawl/types';

const deepcrawl = new DeepcrawlApp({
  apiKey: process.env.DEEPCRAWL_API_KEY,
  baseUrl: "https://api.deepcrawl.dev",
  headers: {
    'User-Agent': 'MyApp/1.0'
  },
  fetch: customFetch,
  fetchOptions: {
    timeout: 30000
  }
});
```

### **Connection Pooling (Node.js)**

Automatic HTTP connection pooling in Node.js:

```typescript
// Automatic configuration
{
  keepAlive: true,
  maxSockets: 10,
  maxFreeSockets: 5,
  timeout: 60000,
  keepAliveMsecs: 30000
}
```

Benefits:

- ⚡ Faster for concurrent requests
- 🔄 Connection reuse reduces handshake overhead
- 🎯 Auto-cleanup of idle connections

## 🔒 **Security Best Practices**

### **Next.js Server Actions (Recommended)**

```typescript
// ✅ SECURE: lib/deepcrawl.ts
'use server';

import { DeepcrawlApp } from 'deepcrawl';

export const deepcrawlClient = new DeepcrawlApp({
  apiKey: process.env.DEEPCRAWL_API_KEY
});
```

```typescript
// ✅ SECURE: app/actions/scrape.ts
'use server';

import { deepcrawlClient } from '@/lib/deepcrawl';

export async function scrapeAction(url: string) {
  return deepcrawlClient.readUrl(url);
}
```

```typescript
// ✅ SECURE: Client component
'use client';

import { scrapeAction } from '@/app/actions/scrape';

export function ScrapeButton() {
  const handleClick = async () => {
    const result = await scrapeAction('https://example.com');
    console.log(result);
  };

  return <button onClick={handleClick}>Scrape</button>;
}
```

### **What NOT to Do**

```typescript
// ❌ INSECURE: Direct SDK usage in client components
'use client';

import { DeepcrawlApp } from 'deepcrawl';

export function BadComponent() {
  const deepcrawl = new DeepcrawlApp({
    apiKey: process.env.DEEPCRAWL_API_KEY // ❌ Exposes API key!
  });
}
```

## 🌍 **Environment Support**

**⚠️ Server-Side Only**: The Deepcrawl SDK is designed for server-side use:

- ✅ Node.js (18+) with connection pooling
- ✅ Cloudflare Workers
- ✅ Vercel Edge Runtime
- ✅ Next.js Server Actions (recommended)
- ✅ Deno, Bun, and other modern runtimes
- ❌ Browser environments (use Server Actions instead)

## 📄 **License**

MIT - see [LICENSE](LICENSE) for details.

## 🤝 **Support**

- 📖 [Documentation](https://docs.deepcrawl.dev)
- 🐛 [Issues](https://github.com/deepcrawl/deepcrawl/issues)
- 💬 [Community Discord](https://discord.gg/deepcrawl)

---

**Built with ❤️ by the [@felixLu](https://x.com/felixlu1018)**
