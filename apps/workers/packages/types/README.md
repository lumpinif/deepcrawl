# @deepcrawl-worker/types

TypeScript types and schemas for the @deepcrawl-worker API.

## Installation

```bash
npm install @deepcrawl-worker/types
# or
yarn add @deepcrawl-worker/types
# or
pnpm add @deepcrawl-worker/types
# or
bun add @deepcrawl-worker/types
```

## Usage

### Path-Specific Imports (Recommended)

```typescript
// Import specific types from their modules
import type { LinksOptions, LinksTree(or Tree) } from "@deepcrawl-worker/types/links";
import type { ExtractedLinks } from "@deepcrawl-worker/types/services/link";
import type { HTMLCleaningOptions } from "@deepcrawl-worker/types/services/html-cleaning";
import type { PageMetadata } from "@deepcrawl-worker/types/services/metadata";
import type { ScrapedData } from "@deepcrawl-worker/types/services/cheerio";

// This approach enables better tree-shaking and smaller bundles
```

### Root Imports (All Types)

```typescript
// Import all types from the root
import type {
  LinksOptions,
  LinksTree,
  ExtractedLinks,
  HTMLCleaningOptions,
  PageMetadata,
  ScrapedData,
} from "@deepcrawl-worker/types";

// Note: This approach imports all types and may result in larger bundles
```

### Runtime Validation with Zod Schemas

```typescript
import { LinksOptionsSchema } from "@deepcrawl-worker/types/links";
import { HTMLCleaningOptionsSchema } from "@deepcrawl-worker/types/services/html-cleaning";

// Validate data at runtime
const options = {
  url: "https://example.com",
  metadata: true,
  cleanedHtml: true,
  rawHtml: false,
};

const validated = LinksOptionsSchema.parse(options);
```

## Available Types

### Links Types

- `LinksOptions` - Configuration options for link extraction
- `LinksTree` - Tree structure of extracted links

### Service Types

#### HTML Cleaning

- `HTMLCleaningOptions` - Configuration for HTML cleaning process

#### Link Extraction

- `LinkExtractionOptions` - Options for extracting links from HTML
- `ExtractedLinks` - Result of link extraction process

#### Metadata

- `MetadataOptions` - Options for metadata extraction
- `PageMetadata` - Extracted metadata from a page

#### Cheerio

- `ScrapedData` - Data scraped using Cheerio

## Package Structure

```bash
src/
  ├── index.ts                    # Main entry point with all exports
  ├── links/                       # Links-related types
  │   ├── index.ts                # Links exports
  │   └── types.ts                 # Links type definitions
  └── services/                   # Service-specific types
      ├── cheerio/                # Cheerio service types
      │   ├── index.ts            # Cheerio exports
      │   └── types.ts            # Cheerio type definitions
      ├── html-cleaning/          # HTML cleaning service types
      │   ├── index.ts            # HTML cleaning exports
      │   └── types.ts            # HTML cleaning type definitions
      ├── link/                   # Link service types
      │   ├── index.ts            # Link service exports
      │   └── types.ts            # Link service type definitions
      └── metadata/               # Metadata service types
          ├── index.ts            # Metadata exports
          └── types.ts            # Metadata type definitions
```

## Development

```bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Run development mode with watch
pnpm dev

# Run type checking
pnpm typecheck

# Run linting and formatting
pnpm fix
```

## License

MIT
