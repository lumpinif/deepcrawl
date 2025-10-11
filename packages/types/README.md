# @deepcrawl/types

TypeScript types and Zod schemas for the Deepcrawl API ecosystem.

## Features

- ✅ **Runtime validation** - Zod schemas for API request/response validation
- ✅ **Type-safe contracts** - Shared types across client and server
- ✅ **oRPC integration** - Type definitions for oRPC endpoints
- ✅ **Service schemas** - Validation schemas for all core services
- ✅ **Configuration types** - Environment and config type definitions

## Package Structure

```
src/
├── common/
│   ├── response-schemas.ts    # Base error/success response schemas
│   ├── shared-schemas.ts       # Boolean schema helpers
│   └── index.ts
├── routers/
│   ├── read/                  # Read operation types & schemas
│   │   ├── types.ts           # ReadOptions, ReadResponse types
│   │   └── index.ts
│   └── links/                 # Links extraction types & schemas
│       ├── types.ts           # LinksOptions, LinksResponse, LinksTree types
│       └── index.ts
├── services/
│   ├── scrape/                # Core scraping types (ScrapedData, ScrapeOptions)
│   ├── html-cleaning/         # HTML cleaning processors
│   ├── metadata/              # Page metadata extraction
│   ├── link/                  # Link extraction utilities
│   ├── cache/                 # Cloudflare KV caching
│   └── markdown/              # HTML to markdown conversion
├── metrics/                   # Performance metrics types
└── configs/                   # Default configuration values
```

## Usage

### Import Router Types
```typescript
// Read operation types
import { 
  ReadOptions, 
  ReadResponse,
  ReadSuccessResponse,
  ReadErrorResponse 
} from '@deepcrawl/types/routers/read';

// Links operation types
import { 
  LinksOptions,
  LinksResponse,
  LinksTree,
  TreeOptions 
} from '@deepcrawl/types/routers/links';
```

### Import Schemas for Validation
```typescript
import { 
  ReadOptionsSchema, 
  ReadSuccessResponseSchema 
} from '@deepcrawl/types/routers/read';

import {
  LinksOptionsSchema,
  LinksTreeSchema
} from '@deepcrawl/types/routers/links';

// Validate request data
const validatedOptions = ReadOptionsSchema.parse(requestData);
```

### Service-Specific Types
```typescript
// Core scraping types
import { ScrapedData, ScrapeOptions, FetchOptions } from '@deepcrawl/types/services/scrape';

// HTML cleaning types
import { HTMLRewriterOptions, ReaderCleaningOptions } from '@deepcrawl/types/services/html-cleaning';

// Metadata extraction types
import { PageMetadata, MetadataOptions } from '@deepcrawl/types/services/metadata';

// Link extraction types
import { ExtractedLinks, LinkExtractionOptions } from '@deepcrawl/types/services/link';

// Cache configuration types
import { CacheOptions } from '@deepcrawl/types/services/cache';

// Markdown conversion types
import { MarkdownConverterOptions } from '@deepcrawl/types/services/markdown';

// Performance metrics types
import { MetricsOptions, Metrics } from '@deepcrawl/types/metrics';
```

## Router Types Reference

### Read Router (`/routers/read`)

The read router provides types for web page content extraction operations.

#### Key Types

- **`ReadOptions`** - Configuration for read operations
  - `url`: **Required** - Target URL to read
  - `markdown`: Optional boolean - Include markdown conversion (default: true)
  - `cleanedHtml`: Optional boolean - Include sanitized HTML (default: false)
  - `rawHtml`: Optional boolean - Include original HTML (default: false)
  - `metadata`: Optional boolean - Extract page metadata (default: true)
  - `robots`: Optional boolean - Fetch and parse robots.txt (default: false)
  - `sitemapXML`: Optional boolean - Fetch and parse sitemap.xml (default: false)
  - `cleaningProcessor`: Optional 'cheerio-reader' | 'html-rewriter' - HTML cleaning method (default: 'cheerio-reader')
  - `metadataOptions`: Optional object - Metadata extraction configuration (all true by default)
    - `title`, `description`, `language`, `canonical`, `robots`, `author`, `keywords`, `favicon`, `openGraph`, `twitter`
  - `markdownConverterOptions`: Optional object - Markdown conversion settings
  - `htmlRewriterOptions`: Optional object - HTML Rewriter processor options
  - `readerCleaningOptions`: Optional object - Cheerio Reader processor options
  - `fetchOptions`: Optional object - Fetch request options
  - `cacheOptions`: Optional object - Cache configuration (default: 4 days TTL)
  - `metricsOptions`: Optional object - Performance tracking (default: enabled)

- **`ReadResponse`** - Union type: `string | ReadSuccessResponse | ReadErrorResponse`
  - ⚠️ **IMPORTANT**: When using `getMarkdown` endpoint, response is a **plain string** (the markdown content)
  - For `readUrl` endpoint, response is `ReadSuccessResponse | ReadErrorResponse` object

- **`ReadSuccessResponse`** - Successful response structure
  - `success`: true
  - `targetUrl`: string - Final URL after redirects
  - `markdown`: Optional string - Markdown content (if requested)
  - `cleanedHtml`: Optional string - Sanitized HTML (if requested)
  - `rawHtml`: Optional string - Original HTML (if requested)
  - `metadata`: Optional object - Page metadata (if requested)
  - `metrics`: Optional object - Performance metrics (if enabled)

- **`ReadErrorResponse`** - Error response structure
  - `success`: false
  - `error`: string - Error message
  - `targetUrl`: string - URL that failed

#### Key Schemas

- **`ReadOptionsSchema`** - Zod schema for request validation
- **`ReadSuccessResponseSchema`** - Zod schema for success response validation
- **`ReadErrorResponseSchema`** - Zod schema for error response validation

#### ⚠️ Common Pitfalls

1. **Response Type Confusion**: `getMarkdown` returns a string, not an object!

   ```typescript
   // ❌ Wrong - will fail at runtime
   const result = await getMarkdown(url);
   console.log(result.markdown); // TypeError: Cannot read property 'markdown' of string

   // ✅ Correct - getMarkdown returns the markdown string directly
   const markdown = await getMarkdown(url);
   console.log(markdown); // Works!
   ```

2. **Missing Metadata**: Metadata is only included when `metadata: true` is set

   ```typescript
   // ❌ Wrong - metadata will be undefined
   const result = await readUrl(url);
   console.log(result.metadata.title); // TypeError: Cannot read property 'title' of undefined

   // ✅ Correct - explicitly request metadata
   const result = await readUrl(url, { metadata: true });
   console.log(result.metadata?.title); // Safe access with optional chaining
   ```

### Links Router (`/routers/links`)

The links router provides types for link extraction and site mapping operations.

#### Key Types

- **`LinksOptions`** - Configuration for links extraction
  - `url`: **Required** - Target URL to extract links from
  - `tree`: Optional boolean - Build hierarchical site tree (**default: true** ⚠️)
  - Tree building options (flattened at root level, **only used when `tree: true`**):
    - `folderFirst`: Optional boolean - Place folders before leaf nodes (default: true)
    - `linksOrder`: Optional 'page' | 'alphabetical' - Link ordering strategy (default: 'page')
      - 'page': Preserve original document order
      - 'alphabetical': Sort A→Z by URL
    - `extractedLinks`: Optional boolean - Include extracted links for each node (default: true)
    - `subdomainAsRootUrl`: Optional boolean - Treat subdomain as root URL (default: true)
      - If false: `https://swr.vercel.app` → `https://vercel.app`
    - `isPlatformUrl`: Optional boolean - Whether URL is a platform URL like GitHub (default: false)
      - If true and platform detected: Use platform-specific URL patterns
  - `linkExtractionOptions`: Optional object - Link extraction configuration
    - `includeExternal`: boolean (default: false)
    - `includeMedia`: boolean (default: false)
    - `removeQueryParams`: boolean (default: true)
  - `cacheOptions`: Optional object - Cache configuration (default: 4 days TTL)
  - `metricsOptions`: Optional object - Enable performance tracking (default: enabled)

- **`LinksResponse`** - Union type: `LinksSuccessResponse | LinksErrorResponse`

- **`LinksSuccessResponse`** - Discriminated union type (structure changes based on `tree` option!)
  - This is a **union** of `LinksSuccessResponseWithTree` | `LinksSuccessResponseWithoutTree`
  - ⚠️ **CRITICAL**: Content location changes based on tree option!

- **`LinksSuccessResponseWithTree`** - Response when `tree: true`
  - Base fields:
    - `requestId`: string - Unique request identifier
    - `success`: true
    - `cached`: boolean - Whether result is from cache
    - `targetUrl`: string - Final URL after redirects
    - `timestamp`: string - ISO 8601 timestamp
    - `ancestors`: Optional string array - Parent URLs
    - `metrics`: Optional object - Performance metrics
    - **`tree`: LinksTree object** - Site hierarchy starting from root
  - ⚠️ **Content fields** (title, description, metadata, extractedLinks) are **INSIDE tree root**, NOT at response root!
  - The tree object contains: `url`, `rootUrl`, `name`, `totalUrls`, `lastUpdated`, `metadata`, `cleanedHtml`, `extractedLinks`, `skippedUrls`, `children`

- **`LinksSuccessResponseWithoutTree`** - Response when `tree: false` or omitted (default)
  - Base fields: (same as with-tree)
  - **Content fields at response root**:
    - `title`: Optional string - Page title
    - `description`: Optional string - Page description
    - `metadata`: Optional object - Page metadata
    - `cleanedHtml`: Optional string - Sanitized HTML
    - `extractedLinks`: Optional object - Categorized links (internal, external, media)
    - `skippedUrls`: Optional object - Skipped URLs with reasons
  - ⚠️ **NO `tree` field** - tree is undefined/not included

- **`LinksTree` (SiteTree)** - Hierarchical site map tree node (recursive structure)
  - `url`: **Required** string - The URL of this page
  - `rootUrl`: Optional string - Root URL of the website
  - `name`: Optional string - Display name or title of this page
  - `totalUrls`: Optional number - Total URLs discovered in entire tree
  - `lastUpdated`: **Required** string - ISO timestamp when page was last crawled
  - `lastVisited`: Optional string | null - ISO timestamp when page was last visited
  - `error`: Optional string - Error message if processing failed
  - `metadata`: Optional object - Extracted page metadata (title, description, OG tags, etc.)
  - `cleanedHtml`: Optional string - Sanitized HTML content
  - `extractedLinks`: Optional object - Categorized links (internal, external, media)
  - `skippedUrls`: Optional object - URLs skipped with reasons
  - **`children`: Optional array of LinksTree** - Recursive array of child pages

- **`LinksErrorResponse`** - Error response structure
  - `success`: false
  - `error`: string - Error message
  - `targetUrl`: string - URL that failed
  - `timestamp`: string - ISO 8601 timestamp
  - `tree`: Optional - Partial tree (if extraction partially succeeded)

- **`TreeOptions`** - Configuration for tree building
  - `foldersOrder`: 'first' | 'last' | 'mixed' (default: 'first')
  - `linksOrder`: 'discovered' | 'alphabetical' (default: 'discovered')

#### Links Schemas

- **`LinksOptionsSchema`** - Zod schema for request validation
- **`LinksSuccessResponseWithTreeSchema`** - Success response WITH tree
- **`LinksSuccessResponseWithoutTreeSchema`** - Success response WITHOUT tree
- **`LinksSuccessResponseSchema`** - Union of both response types
- **`LinksTreeSchema`** - Zod schema for tree structure validation
- **`LinksErrorResponseSchema`** - Error response validation

#### ⚠️ Critical Warnings for Links Endpoint

1. **Content Location Changes Based on `tree` Option** - THE MOST DANGEROUS TRAP:

   ```typescript
   // ❌ DANGER - Trying to access content at wrong level with tree
   const result = await extractLinks(url, { tree: true });
   console.log(result.title); // undefined! title is in tree.metadata.title
   console.log(result.extractedLinks); // undefined! links are in tree.extractedLinks
   console.log(result.metadata?.title); // undefined! metadata is at tree.metadata

   // ✅ Correct - Access content from tree root when tree is enabled
   const result = await extractLinks(url, { tree: true });
   if (result.tree) {
     console.log(result.tree.metadata?.title); // Works!
     console.log(result.tree.extractedLinks); // Works!
     console.log(result.tree.name); // Works!
   }

   // ❌ DANGER - Trying to access tree when explicitly disabled
   const result = await extractLinks(url, { tree: false });
   console.log(result.tree.children); // TypeError: Cannot read property 'children' of undefined

   // ✅ Correct - Access content at response root when tree is disabled
   const result = await extractLinks(url, { tree: false });
   console.log(result.title); // Works!
   console.log(result.extractedLinks); // Works!
   console.log(result.metadata?.title); // Works!

   // ⚠️ DEFAULT BEHAVIOR - Tree is ENABLED by default!
   const result = await extractLinks(url); // tree: true by default
   // Content is in tree, NOT at root!
   console.log(result.tree.metadata?.title); // Works!
   console.log(result.title); // undefined - content is in tree!
   ```

2. **TypeScript Narrowing with Tree Option**:

   ```typescript
   // ✅ Best Practice - Use discriminated union pattern
   const result = await extractLinks(url, { tree: true });

   if ('tree' in result && result.tree) {
     // TypeScript knows tree exists here
     const rootName = result.tree.name;
     const childCount = result.tree.children.length;
   } else {
     // Response without tree
     const linkCount = result.totalLinks;
   }
   ```

3. **Tree Options Ignored When `tree: false`**:

   ```typescript
   // ❌ Wrong - treeOptions has no effect when tree: false
   const result = await extractLinks(url, {
     tree: false,
     treeOptions: { foldersOrder: 'first' } // IGNORED!
   });

   // ✅ Correct - Only set treeOptions when tree: true
   const result = await extractLinks(url, {
     tree: true,
     treeOptions: { foldersOrder: 'first' }
   });
   ```

4. **Default Behavior** - Tree is **ENABLED** by default:

   ```typescript
   // ⚠️ CRITICAL: Default behavior has tree ENABLED
   const result = await extractLinks(url);
   // result.tree exists! Content is inside tree.metadata, tree.extractedLinks, etc.

   // ❌ WRONG - Assuming no tree by default
   console.log(result.title); // undefined!
   console.log(result.extractedLinks); // undefined!

   // ✅ CORRECT - Access from tree
   console.log(result.tree.metadata?.title); // Works!
   console.log(result.tree.extractedLinks); // Works!

   // To get flat response without tree, explicitly disable it:
   const flatResult = await extractLinks(url, { tree: false });
   console.log(flatResult.title); // Now works!
   console.log(flatResult.extractedLinks); // Now works!
   ```

5. **Partial Tree in Error Response**:

   ```typescript
   // Error responses MAY include partial tree data
   try {
     const result = await extractLinks(url, { tree: true });
   } catch (error) {
     if (error instanceof LinksError) {
       // error.data.tree might contain partial results
       const partialTree = error.data.tree;
       if (partialTree) {
         console.log('Partial results available:', partialTree.children.length);
       }
     }
   }
   ```

### Logs Router (`/routers/logs`)

The logs router provides types for activity log retrieval and export operations.

#### Key Types

- **`GetManyLogsOptions`** - Paginated logs filtering
  - `limit`: Optional number (default: 20, max: 100) - Max results per page
  - `offset`: Optional number (default: 0) - Skip first N results
  - `path`: Optional string - Filter by endpoint path (e.g., 'read-getMarkdown', 'links-extractLinks')
  - `success`: Optional boolean - Filter by success status
  - `startDate`: Optional ISO 8601 string - Filter from date
  - `endDate`: Optional ISO 8601 string - Filter to date
  - `orderBy`: Optional string (default: 'requestTimestamp') - Sort column
  - `orderDir`: Optional 'asc' | 'desc' (default: 'desc') - Sort direction

- **`GetManyLogsResponse`** - Paginated response with metadata
  - `logs`: Array of ActivityLogEntry - Log entries with discriminated unions
  - `meta`: Object with pagination info
    - `limit`: number - Effective limit applied
    - `offset`: number - Effective offset applied
    - `hasMore`: boolean - More logs available?
    - `nextOffset`: number | null - Next page offset (null if no more data)
    - `orderBy`: string - Column used for sorting
    - `orderDir`: 'asc' | 'desc' - Sort direction applied
    - `startDate`: Optional string - Normalized start date boundary
    - `endDate`: Optional string - Normalized end date boundary

- **`ActivityLogEntry`** - Discriminated union based on `path` field
  - Each entry includes: `id`, `path`, `success`, `requestOptions`, `response`, `requestTimestamp`
  - Type narrowing based on `path` value:
    - `'read-getMarkdown'`: response is `string`
    - `'read-readUrl'`: response is `ReadSuccessResponse | ReadErrorResponse`
    - `'links-getLinks'`: response is `LinksSuccessResponse | LinksErrorResponse`
    - `'links-extractLinks'`: response is `LinksSuccessResponse | LinksErrorResponse`

- **`GetOneLogOptions`** - Single log retrieval
  - `id`: Required string - Request ID (log identifier)

- **`GetOneLogResponse`** - Single ActivityLogEntry with discriminated union

- **`ExportResponseOptions`** - Export configuration
  - `id`: Required string - Request ID to export
  - `format`: Required 'json' | 'markdown' | 'links' - Export format

- **`ExportResponseOutput`** - Union of all possible export formats
  - Format 'json': Full response object
  - Format 'markdown': String (markdown content)
  - Format 'links': SiteTree object (links tree)

#### ⚠️ Logs Pitfalls and Type Narrowing

1. **Discriminated Union Type Narrowing**:

   ```typescript
   // ❌ Wrong - TypeScript can't narrow without checking path
   const log = await getOneLog({ id: 'log-123' });
   console.log(log.response.markdown); // Type error: Property 'markdown' may not exist

   // ✅ Correct - Use discriminated union pattern
   const log = await getOneLog({ id: 'log-123' });
   if (log.path === 'read-readUrl') {
     // TypeScript knows response is ReadSuccessResponse | ReadErrorResponse
     if ('success' in log.response && log.response.success) {
       console.log(log.response.markdown); // Safe!
     }
   } else if (log.path === 'read-getMarkdown') {
     // TypeScript knows response is string
     console.log(log.response.length); // Safe!
   }
   ```

2. **Export Format Mismatch**:

   ```typescript
   // ❌ Wrong - Requesting markdown from a links request
   const exported = await exportResponse({
     id: 'links-request-id',
     format: 'markdown' // Will fail - this request doesn't have markdown!
   });

   // ✅ Correct - Match format to request type
   const exported = await exportResponse({
     id: 'links-request-id',
     format: 'links' // Exports the links tree
   });
   ```

## Development

```bash
# Type checking
pnpm typecheck

# Build package
pnpm build

# Watch mode for development
pnpm dev

# Format and lint
pnpm check
```

## Architecture

This package serves as the central source of truth for all type definitions used across the Deepcrawl ecosystem, ensuring type safety and consistency between:

- **oRPC contracts** - Type-safe API definitions
- **Service implementations** - Business logic validation
- **Client libraries** - SDK type safety
- **Database schemas** - Data model consistency