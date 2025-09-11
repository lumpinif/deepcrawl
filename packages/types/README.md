# @deepcrawl/types

**TypeScript types and Zod schemas** for the Deepcrawl API ecosystem.

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
│   ├── smart-schemas.ts       # Boolean schema helpers
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

#### Key Types:
- **`ReadOptions`** - Configuration for read operations (URL, markdown, caching, etc.)
- **`ReadResponse`** - Union of all possible responses (string | success | error)
- **`ReadSuccessResponse`** - Successful response with extracted content and metadata
- **`ReadErrorResponse`** - Error response with failure details

#### Key Schemas:
- **`ReadOptionsSchema`** - Validates read operation configuration
- **`ReadSuccessResponseSchema`** - Validates successful response data
- **`ReadErrorResponseSchema`** - Validates error response data

### Links Router (`/routers/links`)

The links router provides types for link extraction and site mapping operations.

#### Key Types:
- **`LinksOptions`** - Configuration for links extraction (URL, tree options, etc.)
- **`LinksResponse`** - Union of success/error responses
- **`LinksTree`** - Hierarchical site map structure
- **`TreeOptions`** - Configuration for tree building (folder ordering, link sorting)

#### Key Schemas:
- **`LinksOptionsSchema`** - Validates links operation configuration
- **`LinksTreeSchema`** - Validates tree structure data
- **`LinksSuccessResponseSchema`** - Validates successful response with links/tree

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