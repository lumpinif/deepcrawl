# @deepcrawl-sdk/ts

Official TypeScript SDK for DeepCrawl API - A powerful web scraping and crawling service.

## ⚡ Features

- **RPC-First Design**: Uses oRPC's efficient RPCLink for optimal performance
- **Full Type Safety**: End-to-end type safety from contracts to client
- **Universal Runtime**: Works in Node.js, browsers, Edge Runtime, and Server Actions
- **Lightweight**: Minimal bundle size with tree-shaking support
- **Error Handling**: Comprehensive error handling with custom error types

## Installation

```bash
npm install @deepcrawl-sdk/ts
# or
yarn add @deepcrawl-sdk/ts
# or
pnpm add @deepcrawl-sdk/ts
```

## Quick Start

```typescript
import DeepcrawlApp, { ReadPostResponse } from '@deepcrawl-sdk/ts';

const app = new DeepcrawlApp({
  apiKey: "dc-YOUR_API_KEY"
});

// Read a website
const readResponse: ReadPostResponse = await app.readUrl('https://deepcrawl.dev', {
  metadata: true,
  markdown: true,
  cleanedHtml: false,
  robots: false,
  rawHtml: false,
});

if (!readResponse.success) {
  throw new Error(`Failed to read: ${readResponse.error}`);
}

console.log(readResponse);
```

## API Reference

### DeepCrawlApp

#### Constructor

```typescript
const app = new DeepcrawlApp(config: DeepCrawlConfig);
```

**DeepCrawlConfig:**
- `apiKey` (string, required): Your DeepCrawl API key
- `baseUrl` (string, optional): Base URL for the API (default: `https://api.deepcrawl.dev`)
- `timeout` (number, optional): Request timeout in milliseconds (default: 30000)
- `headers` (object, optional): Additional headers to include in requests

#### RequestOptions

Per-request configuration that overrides the global config:

- `timeout` (number, optional): Override request timeout for this specific request
- `headers` (object, optional): Additional headers for this specific request (merged with global headers)

#### Methods

##### `readUrl(url, options?, requestOptions?)`

Read and extract content from a URL.

**Parameters:**
- `url` (string): The URL to read
- `options` (ReadOptions, optional): Configuration options
- `requestOptions` (RequestOptions, optional): Request-specific options

**Returns:** `Promise<ReadPostResponse>`

**Example:**
```typescript
const result = await app.readUrl('https://example.com', {
  metadata: true,
  markdown: true,
  cleanedHtml: false,
  robots: false,
  rawHtml: false,
}, {
  timeout: 60000, // 60 second timeout for this specific request
  headers: {
    'X-Custom-Header': 'value'
  }
});
```

##### `getMarkdown(url, requestOptions?)`

Get only the markdown content from a URL.

**Parameters:**
- `url` (string): The URL to read
- `requestOptions` (RequestOptions, optional): Request-specific options

**Returns:** `Promise<string>`

**Example:**
```typescript
const markdown = await app.getMarkdown('https://example.com', {
  timeout: 30000,
  headers: { 'User-Agent': 'MyBot/1.0' }
});
console.log(markdown);
```

##### `extractLinks(url, options?, requestOptions?)`

Extract links from a URL.

**Parameters:**
- `url` (string): The URL to extract links from
- `options` (LinksOptions, optional): Configuration options
- `requestOptions` (RequestOptions, optional): Request-specific options

**Returns:** `Promise<LinksSuccessResponse>`

**Example:**
```typescript
const links = await app.extractLinks('https://example.com');
console.log(links);
```

##### `getLinks(url, requestOptions?)`

Get links from a URL (simplified version).

**Parameters:**
- `url` (string): The URL to get links from
- `requestOptions` (RequestOptions, optional): Request-specific options

**Returns:** `Promise<LinksSuccessResponse>`

## Types

The SDK exports comprehensive TypeScript types for all API responses and options:

```typescript
import type {
  ReadOptions,
  ReadPostResponse,
  ReadSuccessResponse,
  ReadErrorResponse,
  LinksOptions,
  LinksSuccessResponse,
  LinksErrorResponse,
  ScrapedData,
  PageMetadata,
  DeepCrawlConfig,
  RequestOptions,
} from '@deepcrawl-sdk/ts';
```

## Error Handling

The SDK provides custom error classes for different types of failures:

```typescript
import { DeepCrawlError, DeepCrawlAuthError, DeepCrawlNetworkError } from '@deepcrawl-sdk/ts';

try {
  const result = await app.readUrl('https://example.com');
} catch (error) {
  if (error instanceof DeepCrawlAuthError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof DeepCrawlNetworkError) {
    console.error('Network error:', error.message);
  } else if (error instanceof DeepCrawlError) {
    console.error('API error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Environment Support

This SDK works in:
- Node.js (18+)
- Browser environments
- Cloudflare Workers
- Vercel Edge Runtime
- Next.js Server Actions
- Other JavaScript runtimes with fetch support

### Next.js Server Actions Example

The SDK works perfectly in Next.js server actions and automatically handles header forwarding for session-based authentication:

```typescript
// app/actions/scrape.ts
'use server'

import DeepcrawlApp from '@deepcrawl-sdk/ts';
import { headers } from 'next/headers';

export async function scrapeUrl(url: string) {
  const app = new DeepcrawlApp({
    apiKey: process.env.DEEPCRAWL_API_KEY!,
    // Automatically extracts only auth headers (cookies, authorization) for security
    headers: await headers(), 
  });

  try {
    const result = await app.readUrl(url, {
      metadata: true,
      markdown: true,
    });

    if (!result.success) {
      throw new Error(`Failed to scrape: ${result.error}`);
    }

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Scraping failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

```typescript
// app/page.tsx
import { scrapeUrl } from './actions/scrape';

export default function HomePage() {
  async function handleScrape(formData: FormData) {
    'use server'
    
    const url = formData.get('url') as string;
    const result = await scrapeUrl(url);
    
    if (result.success) {
      console.log('Scraped data:', result.data);
    } else {
      console.error('Error:', result.error);
    }
  }

  return (
    <form action={handleScrape}>
      <input name="url" placeholder="Enter URL to scrape" />
      <button type="submit">Scrape</button>
    </form>
  );
}
```

## License

MIT

## Support

For issues and questions, please visit our [GitHub Issues](https://github.com/lumpinif/deepcrawl/issues).