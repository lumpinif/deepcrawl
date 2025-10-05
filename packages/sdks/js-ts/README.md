# 🕷️ Deepcrawl SDK

**World-class TypeScript SDK for the Deepcrawl API** - Professional web scraping and crawling with enterprise-grade error handling.

[![npm version](https://badge.fury.io/js/deepcrawl.svg)](https://www.npmjs.com/package/deepcrawl)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## ⚡ **Why Deepcrawl SDK?**

- 🏗️ **oRPC-Powered**: Built on industry-leading RPC framework for optimal performance
- 🔒 **Type-Safe**: End-to-end TypeScript with intelligent error handling
- 🖥️ **Server-Side Only**: Designed for Node.js, Cloudflare Workers, and Next.js Server Actions
- 🪶 **Lightweight**: Minimal bundle size with tree-shaking support
- 🛡️ **World-Class Error Handling**: Comprehensive, typed errors with actionable context
- 🔄 **Smart Retry Logic**: Built-in exponential backoff for transient failures
- ⚡ **Connection Pooling**: Automatic HTTP connection reuse for optimal performance (Node.js)

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
  apiKey: "dc-YOUR_API_KEY"
});

try {
  const result = await deepcrawl.readUrl('https://example.com');
  console.log(result.markdown);
} catch (error) {
  console.error('Scraping failed:', error.message);
}
```

## 📖 **API Methods**

### **readUrl(url, options?)**
Extract clean content and metadata from any URL.

```typescript
const result = await deepcrawl.readUrl('https://example.com', {
  metadata: true,        // Extract page metadata
  markdown: true,        // Convert to markdown
  cleanedHtml: true,     // Get sanitized HTML
  rawHtml: true,        // Get original HTML
  screenshot: false,     // Capture screenshot
  metricsOptions: {     // Performance tracking
    enable: true
  }
});

// Response type
interface ReadUrlResponse {
  targetUrl: string;
  success: boolean;
  markdown?: string;
  cleanedHtml?: string;
  rawHtml?: string;
  screenshot?: string;
  metadata?: {
    title?: string;
    description?: string;
    author?: string;
    publishedTime?: string;
    ogImage?: string;
    favicon?: string;
  };
  metrics?: {
    readableDuration: string;
    durationMs: number;
    startTimeMs: number;
    endTimeMs: number;
  };
}
```

### **getMarkdown(url, options?)**
Simplified method to get just markdown content.

```typescript
const result = await deepcrawl.getMarkdown('https://example.com', {
  metricsOptions: { enable: true }
});

// Response type
interface GetMarkdownResponse {
  targetUrl: string;
  success: boolean;
  markdown: string;
  metrics?: {
    readableDuration: string;
    durationMs: number;
    startTimeMs: number;
    endTimeMs: number;
  };
}
```

### **extractLinks(url, options?)**
Extract all links from a page with powerful filtering options.

```typescript
const result = await deepcrawl.extractLinks('https://example.com', {
  includeInternal: true,
  includeExternal: false,
  includeEmails: false,
  includePhoneNumbers: false,
  includeSocialMedia: false,
  metricsOptions: { enable: true }
});

// Response type
interface ExtractLinksResponse {
  targetUrl: string;
  success: boolean;
  tree: {
    internal: Array<{ href: string; text: string }>;
    external: Array<{ href: string; text: string }>;
    emails: string[];
    phoneNumbers: string[];
    socialMedia: Array<{ platform: string; url: string }>;
  };
  metrics?: {
    readableDuration: string;
    durationMs: number;
    startTimeMs: number;
    endTimeMs: number;
  };
}
```

### **getManyLogs(options?)**
Retrieve activity logs with type-safe filtering.

```typescript
const logs = await deepcrawl.getManyLogs({
  userId: 'user123',           // Filter by user
  url: 'https://example.com',  // Filter by URL
  operation: 'getMarkdown',    // Filter by operation
  status: 'success',           // Filter by status
  limit: 50,                   // Pagination limit
  offset: 0                    // Pagination offset
});

// Response type
interface ActivityLog {
  id: string;
  userId: string;
  sessionId: string;
  url: string;
  operation: 'readUrl' | 'getMarkdown' | 'extractLinks';
  status: 'success' | 'error';
  errorType?: 'auth' | 'network' | 'read' | 'links' | 'unknown';
  errorMessage?: string;
  responseTime?: number;
  createdAt: string;
}
```

### **getOneLog(id)**
Get a single activity log by ID.

```typescript
const log = await deepcrawl.getOneLog('log_abc123');
```

## 🌟 **Real-World Usage Examples**

### 1. **E-commerce Product Monitoring**

```typescript
import { DeepcrawlApp, DeepcrawlError } from 'deepcrawl';

async function monitorProduct(productUrl: string) {
  const deepcrawl = new DeepcrawlApp({ apiKey: process.env.DEEPCRAWL_API_KEY! });

  try {
    const result = await deepcrawl.readUrl(productUrl, {
      metadata: true,
      cleanedHtml: true
    });

    return {
      title: result.metadata?.title,
      price: extractPrice(result.cleanedHtml),
      availability: checkAvailability(result.cleanedHtml),
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    if (DeepcrawlError.isRateLimitError(error)) {
      // Smart retry with exponential backoff
      console.log(`Rate limited. Retrying in ${error.retryAfter} seconds...`);
      await delay(error.retryAfter * 1000);
      return monitorProduct(productUrl);
    }

    if (DeepcrawlError.isReadError(error)) {
      throw new Error(`Failed to scrape ${error.targetUrl}: ${error.userMessage}`);
    }

    throw error;
  }
}
```

### 2. **Content Aggregation Pipeline**

```typescript
import { DeepcrawlApp, DeepcrawlError } from 'deepcrawl';

class ContentAggregator {
  private deepcrawl = new DeepcrawlApp({ apiKey: process.env.DEEPCRAWL_API_KEY! });
  private readonly maxRetries = 3;

  async aggregateArticles(urls: string[]) {
    const results = await Promise.allSettled(
      urls.map(url => this.scrapeWithRetry(url))
    );

    return results.map((result, index) => ({
      url: urls[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }));
  }

  private async scrapeWithRetry(url: string, attempt = 1): Promise<Article> {
    try {
      const result = await this.deepcrawl.readUrl(url, {
        metadata: true,
        markdown: true
      });

      return {
        title: result.metadata?.title || 'Untitled',
        content: result.markdown,
        publishedAt: result.metadata?.publishedTime,
        author: result.metadata?.author,
        sourceUrl: url
      };
    } catch (error) {
      if (error instanceof DeepcrawlError) {
        // Use instance methods for fluent checking
        if (error.isRateLimit() && attempt <= this.maxRetries) {
          await delay(error.retryAfter * 1000 * attempt); // Exponential backoff
          return this.scrapeWithRetry(url, attempt + 1);
        }

        if (error.isNetwork() && attempt <= this.maxRetries) {
          await delay(1000 * attempt);
          return this.scrapeWithRetry(url, attempt + 1);
        }

        if (error.isRead()) {
          throw new Error(`Content unavailable: ${error.userMessage}`);
        }
      }

      throw error;
    }
  }
}
```

### 3. **Next.js Server Actions with Rich Error Handling**

```typescript
// app/actions/scrape.ts
'use server'

import { DeepcrawlApp, DeepcrawlError } from 'deepcrawl';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function scrapeUrlAction(url: string) {
  const deepcrawl = new DeepcrawlApp({
    apiKey: process.env.DEEPCRAWL_API_KEY!,
    headers: await headers(), // Automatic session forwarding
  });

  try {
    const result = await deepcrawl.readUrl(url, {
      metadata: true,
      markdown: true,
    });

    // Cache the result
    await saveToDatabase(url, result);
    revalidatePath('/dashboard');

    return {
      success: true,
      data: {
        title: result.metadata?.title,
        description: result.metadata?.description,
        content: result.markdown,
        targetUrl: result.targetUrl
      }
    };
  } catch (error) {
    if (error instanceof DeepcrawlError) {
      return {
        success: false,
        error: {
          type: error.constructor.name,
          message: error.userMessage,
          retryable: error.isRateLimit() || error.isNetwork(),
          retryAfter: error.isRateLimit() ? error.retryAfter : undefined
        }
      };
    }

    return {
      success: false,
      error: {
        type: 'UnknownError',
        message: 'An unexpected error occurred',
        retryable: false
      }
    };
  }
}
```

### 4. **React Hook with Comprehensive Error States**

```typescript
import { useState, useCallback } from 'react';
import { DeepcrawlApp, DeepcrawlError } from 'deepcrawl';

interface UseScrapingState {
  data: any | null;
  loading: boolean;
  error: string | null;
  retryInfo: { canRetry: boolean; retryAfter?: number } | null;
}

export function useScraping(apiKey: string) {
  const [state, setState] = useState<UseScrapingState>({
    data: null,
    loading: false,
    error: null,
    retryInfo: null
  });

  const deepcrawl = new DeepcrawlApp({ apiKey });

  const scrape = useCallback(async (url: string) => {
    setState(prev => ({ ...prev, loading: true, error: null, retryInfo: null }));

    try {
      const result = await deepcrawl.readUrl(url, { metadata: true });
      setState({
        data: result,
        loading: false,
        error: null,
        retryInfo: null
      });
    } catch (error) {
      if (error instanceof DeepcrawlError) {
        setState({
          data: null,
          loading: false,
          error: error.userMessage,
          retryInfo: {
            canRetry: error.isRateLimit() || error.isNetwork(),
            retryAfter: error.isRateLimit() ? error.retryAfter : undefined
          }
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: 'An unexpected error occurred',
          retryInfo: { canRetry: false }
        });
      }
    }
  }, [deepcrawl]);

  const retry = useCallback(() => {
    if (state.retryInfo?.canRetry) {
      // Re-trigger with the last URL
      scrape(state.data?.targetUrl || '');
    }
  }, [state.retryInfo, state.data, scrape]);

  return { ...state, scrape, retry };
}
```

### 5. **Activity Logging with Server Actions**

```typescript
// app/query/logs-query.server.ts
'use server';

import { deepcrawlClient } from '@/lib/deepcrawl';

/**
 * Server Action: Fetch activity logs with type-safe filtering
 * @param filters - Optional filters for logs
 */
export async function fetchDeepcrawlLogs(filters?: {
  userId?: string;
  url?: string;
  operation?: 'readUrl' | 'getMarkdown' | 'extractLinks';
  status?: 'success' | 'error';
  limit?: number;
  offset?: number;
}) {
  return deepcrawlClient.getManyLogs(filters);
}

// app/actions/logs.ts
'use server';

import { deepcrawlClient } from '@/lib/deepcrawl';

export async function getActivityLogs() {
  try {
    const logs = await deepcrawlClient.getManyLogs({
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

// app/components/activity-logs.client.tsx
'use client';

import { useState, useEffect } from 'react';
import { getActivityLogs } from '@/app/actions/logs';

export function ActivityLogsClient() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivityLogs().then(result => {
      if (result.success) {
        setLogs(result.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {logs.map(log => (
        <div key={log.id}>
          <p>{log.operation} - {log.url}</p>
          <p>Status: {log.status}</p>
          {log.errorMessage && <p>Error: {log.errorMessage}</p>}
        </div>
      ))}
    </div>
  );
}
```

## 🛡️ **Error Handling Patterns**

Our SDK provides multiple patterns for different coding styles:

### **Traditional Try/Catch**
```typescript
try {
  const result = await deepcrawl.readUrl(url);
} catch (error) {
  if (error instanceof DeepcrawlReadError) {
    console.log(`Failed to read ${error.targetUrl}: ${error.message}`);
  }
}
```

### **Static Type Guards**
```typescript
const [error, result] = await safe(deepcrawl.readUrl(url));
if (DeepcrawlError.isRateLimitError(error)) {
  await delay(error.retryAfter * 1000);
}
```

### **Instance Methods**
```typescript
try {
  const result = await deepcrawl.readUrl(url);
} catch (error) {
  if (error.isRateLimit?.()) {
    console.log(`Retry after ${error.retryAfter}s`);
  }
}
```

## 📚 **Error Types Reference**

### **Business Logic Errors**
- `DeepcrawlReadError` - Content extraction failed
- `DeepcrawlLinksError` - Link extraction failed

### **Infrastructure Errors**
- `DeepcrawlRateLimitError` - Rate limit exceeded (includes `retryAfter`)
- `DeepcrawlAuthError` - Authentication failed
- `DeepcrawlValidationError` - Invalid request parameters
- `DeepcrawlNotFoundError` - Resource not found
- `DeepcrawlServerError` - Server-side error
- `DeepcrawlNetworkError` - Network connectivity issues

### **Rich Error Properties**
```typescript
interface ErrorProperties {
  // All errors (consistent across all error types)
  code: string;           // oRPC error code
  status: number;         // HTTP status
  message: string;        // The actual error message (always user-friendly)
  data: any;             // Raw error data from API
  defined: boolean;       // Whether this is a contract-defined error

  // Convenience getters (same as message for consistency)
  userMessage: string;    // Always same as message

  // Read/Links errors (typed getters for convenience)
  targetUrl: string;      // URL that failed (data.targetUrl)
  success: false;         // Always false for errors (data.success)
  error: string;          // Raw error from API (data.error, same as message)

  // Rate limit errors
  retryAfter: number;     // Seconds to wait (data.retryAfter)
  operation: string;      // What operation was rate limited (data.operation)

  // Links errors
  timestamp: string;      // When the error occurred (data.timestamp)
  tree?: any;            // Partial results if available (data.tree)
}
```

## 🔧 **Configuration**

```typescript
const deepcrawl = new DeepcrawlApp({
  apiKey: "dc-YOUR_API_KEY",           // Required
  baseUrl: "https://api.deepcrawl.dev", // Optional (default: production URL)
  headers: {                            // Optional (can be HeadersInit or Next.js headers())
    'User-Agent': 'MyApp/1.0'
  },
  fetch: customFetch,                   // Optional (custom fetch implementation)
  fetchOptions: {                       // Optional (passed to RPCLink)
    timeout: 30000
  }
});
```

### **Connection Pooling (Node.js Only)**

The SDK automatically uses HTTP connection pooling in Node.js environments for optimal performance:

```typescript
// Automatic configuration (no action needed)
{
  keepAlive: true,        // Reuse connections
  maxSockets: 10,         // Max concurrent connections per host
  maxFreeSockets: 5,      // Keep 5 idle connections ready
  timeout: 60000,         // 60s socket timeout
  keepAliveMsecs: 30000   // Send keepalive probe every 30s
}
```

Benefits:
- ⚡ **~40% faster** for concurrent requests
- 🔄 **Connection reuse** reduces handshake overhead
- 🎯 **Auto-cleanup** of idle connections
- 📊 **Optimized for batch operations**

**Note**: Connection pooling is automatically disabled in browser and Edge Runtime environments.

## 🔄 **Built-in Retry Logic**

The SDK includes automatic retry logic with exponential backoff for transient failures:

```typescript
// Automatic retry for rate limits and network errors
const result = await deepcrawl.readUrl('https://example.com');
// If rate limited, automatically waits and retries
// If network error, retries with exponential backoff
```

Retry behavior:
- **Rate Limits**: Waits for `retryAfter` seconds before retry
- **Network Errors**: Exponential backoff (1s, 2s, 4s)
- **Max Attempts**: 3 retries by default
- **Customizable**: Handle errors manually for custom retry logic

## 🔒 **Security Best Practices**

### **Next.js Server Actions (Recommended)**

Always use Server Actions to keep your API key secure:

```typescript
// ✅ SECURE: lib/deepcrawl.ts
'use server';

export const DEEPCRAWL_API_KEY = process.env.DEEPCRAWL_API_KEY as string;
export const deepcrawlClient = new DeepcrawlApp({ apiKey: DEEPCRAWL_API_KEY });
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
// ✅ SECURE: Client component uses Server Action
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
    apiKey: process.env.DEEPCRAWL_API_KEY // ❌ Exposes API key to browser!
  });
  // ...
}
```

## 🌍 **Environment Support**

**⚠️ Server-Side Only**: The Deepcrawl SDK requires an API key and is designed for server-side use only:

- ✅ Node.js (18+) - with connection pooling
- ✅ Cloudflare Workers
- ✅ Vercel Edge Runtime
- ✅ Next.js Server Actions (recommended)
- ✅ Deno, Bun, and other modern runtimes
- ❌ Browser environments (use Server Actions instead)

**Why Server-Side Only?**
- API keys must remain secret and never be exposed to client-side code
- For client-side functionality, use Next.js Server Actions as shown in the examples above
- This architecture ensures your API key stays secure while still enabling client-side interactions

Runtime detection:
```typescript
// Automatic detection
const runtime = deepcrawl.nodeEnv;
// Returns: 'nodeJs' | 'browser' | 'cf-worker'
```

## 📦 **TypeScript Types**

All types are fully exported:

```typescript
import type {
  // Client
  DeepcrawlApp,
  DeepcrawlConfig,

  // API Methods
  ReadUrlOptions,
  ReadUrlResponse,
  GetMarkdownOptions,
  GetMarkdownResponse,
  ExtractLinksOptions,
  ExtractLinksResponse,

  // Activity Logs
  ActivityLog,
  ActivityLogFilters,

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

  // Metadata
  Metadata,
  MetricsOptions,
  Metrics,
} from 'deepcrawl';
```

## 📄 **License**

MIT - see [LICENSE](LICENSE) for details.

## 🤝 **Support**

- 📖 [Documentation](https://docs.deepcrawl.dev)
- 🐛 [Issues](https://github.com/deepcrawl/deepcrawl/issues)
- 💬 [Community Discord](https://discord.gg/deepcrawl)

---

**Built with ❤️ by the Deepcrawl team**
