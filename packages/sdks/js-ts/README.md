# 🕷️ Deepcrawl SDK

**World-class TypeScript SDK for the Deepcrawl API** - Professional web scraping and crawling with enterprise-grade error handling.

[![npm version](https://badge.fury.io/js/deepcrawl.svg)](https://www.npmjs.com/package/deepcrawl)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## ⚡ **Why Deepcrawl SDK?**

- 🏗️ **oRPC-Powered**: Built on industry-leading RPC framework for optimal performance
- 🔒 **Type-Safe**: End-to-end TypeScript with intelligent error handling
- 🌍 **Universal**: Works in Node.js, browsers, Edge Runtime, and Server Actions
- 🪶 **Lightweight**: Minimal bundle size with tree-shaking support
- 🛡️ **World-Class Error Handling**: Comprehensive, typed errors with actionable context

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

### 5. **Background Job with Cancellation**

```typescript
import { DeepcrawlApp, DeepcrawlError } from 'deepcrawl';

class ScrapingJob {
  private controller = new AbortController();
  private deepcrawl = new DeepcrawlApp({ apiKey: process.env.DEEPCRAWL_API_KEY! });

  async processUrls(urls: string[]) {
    try {
      for (const url of urls) {
        if (this.controller.signal.aborted) break;
        
        const result = await this.deepcrawl.readUrl(url, {}, {
          signal: this.controller.signal
        });
        
        await this.processResult(result);
      }
    } catch (error) {
      if (DeepcrawlError.isAbortError(error)) {
        console.log('Job cancelled by user');
        return { cancelled: true };
      }
      
      throw error;
    }
  }
  
  cancel() {
    this.controller.abort();
  }
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
- `DeepcrawlAbortError` - Request was cancelled

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
  baseUrl: "https://api.deepcrawl.dev", // Optional
  headers: {                            // Optional
    'User-Agent': 'MyApp/1.0'
  },
  fetch: customFetch,                   // Optional (Node.js 18+)
  fetchOptions: {                       // Optional
    timeout: 30000
  }
});
```

## 🌍 **Environment Support**

Works everywhere JavaScript runs:
- ✅ Node.js (18+)
- ✅ Browser environments  
- ✅ Cloudflare Workers
- ✅ Vercel Edge Runtime
- ✅ Next.js Server Actions
- ✅ Deno, Bun, and other modern runtimes

## 📄 **License**

MIT - see [LICENSE](LICENSE) for details.

## 🤝 **Support**

- 📖 [Documentation](https://docs.deepcrawl.dev)
- 🐛 [Issues](https://github.com/deepcrawl/deepcrawl/issues)
- 💬 [Community Discord](https://discord.gg/deepcrawl)

---

**Built with ❤️ by the Deepcrawl team**
