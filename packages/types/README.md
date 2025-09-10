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
│   ├── response-schemas.ts    # Shared response types
│   ├── smart-schemas.ts       # Intelligent schema validation
│   └── index.ts
├── routers/
│   ├── read/                  # Read service types
│   └── links/                 # Links service types
├── services/
│   ├── scrape/                # Web scraping types
│   ├── html-cleaning/         # HTML processing types
│   ├── metadata/              # Metadata extraction types
│   ├── link/                  # Link processing types
│   ├── cache/                 # Caching types
│   └── markdown/              # Markdown conversion types
└── configs/                   # Configuration types
```

## Usage

### Import Types
```typescript
import { 
  ReadRequest, 
  ReadResponse,
  LinksRequest,
  LinksResponse 
} from '@deepcrawl/types';
```

### Import Schemas for Validation
```typescript
import { 
  readRequestSchema, 
  readResponseSchema 
} from '@deepcrawl/types/routers/read';

// Validate request data
const validatedData = readRequestSchema.parse(requestData);
```

### Service-Specific Types
```typescript
// HTML cleaning service types
import { HTMLCleaningOptions, CleanedHTML } from '@deepcrawl/types/services/html-cleaning';

// Metadata service types
import { MetadataOptions, ExtractedMetadata } from '@deepcrawl/types/services/metadata';

// Cache service types
import { CacheOptions, CacheResult } from '@deepcrawl/types/services/cache';
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