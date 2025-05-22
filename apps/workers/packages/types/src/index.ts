/**
 * @deepcrawl-worker/types
 *
 * This is the root entry point for the types package.
 * For more specific types, consider importing directly from subpaths:
 *
 * @example
 * // Instead of:
 * import { LinkOptions } from '@deepcrawl-worker/types';
 *
 * // Prefer:
 * import { LinkOptions } from '@deepcrawl-worker/types/routers/link';
 *
 * // Or for service-specific types:
 * import { ScrapedData } from '@deepcrawl-worker/types/services/cheerio';
 * import { HTMLCleaningOptions } from '@deepcrawl-worker/types/services/html-cleaning';
 * import { LinkExtractionOptions } from '@deepcrawl-worker/types/services/link';
 * import { PageMetadata } from '@deepcrawl-worker/types/services/metadata';
 */

// Export a services object for discoverability
import * as CheerioTypes from './services/cheerio/types';
import * as HTMLCleaningTypes from './services/html-cleaning/types';
import * as LinkServiceTypes from './services/link/types';
import * as MetadataTypes from './services/metadata/types';

import * as BrowseRouterTypes from './routers/browse/types';
// Re-export router types for better discoverability
import * as LinksRouterTypes from './routers/links/types';

import type { LinksTree } from './routers/links/types';
export type { LinksTree as Tree };

/**
 * Services namespace - provides access to all service types
 */
export const Services = {
  Cheerio: CheerioTypes,
  HTMLCleaning: HTMLCleaningTypes,
  Link: LinkServiceTypes,
  Metadata: MetadataTypes,
};

/**
 * Routers namespace - provides access to all router types
 */
export const Routers = {
  Links: LinksRouterTypes,
  Browse: BrowseRouterTypes,
};

// Type-only exports for better IDE support
export * as CheerioTypes from './services/cheerio/types';
export * as HTMLCleaningTypes from './services/html-cleaning/types';
export * as LinkServiceTypes from './services/link/types';
export * as MetadataTypes from './services/metadata/types';
export * as LinksRouterTypes from './routers/links/types';
export * as BrowseRouterTypes from './routers/browse/types';

export * from './routers/links/index';
export * from './routers/read/index';
export * from './routers/browse/index';
export * from './services/cheerio/index';
export * from './services/html-cleaning/index';
export * from './services/link/index';
export * from './services/metadata/index';

/**
 * ,
    "./routers/link": {
      "types": "./dist/routers/link/index.d.ts",
      "import": "./dist/routers/link/index.mjs",
      "require": "./dist/routers/link/index.js"
    },
    "./routers/browse": {
      "types": "./dist/routers/browse/index.d.ts",
      "import": "./dist/routers/browse/index.mjs",
      "require": "./dist/routers/browse/index.js"
    },
    "./services/cheerio": {
      "types": "./dist/services/cheerio/index.d.ts",
      "import": "./dist/services/cheerio/index.mjs",
      "require": "./dist/services/cheerio/index.js"
    },
    "./services/html-cleaning": {
      "types": "./dist/services/html-cleaning/index.d.ts",
      "import": "./dist/services/html-cleaning/index.mjs",
      "require": "./dist/services/html-cleaning/index.js"
    },
    "./services/link": {
      "types": "./dist/services/link/index.d.ts",
      "import": "./dist/services/link/index.mjs",
      "require": "./dist/services/link/index.js"
    },
    "./services/metadata": {
      "types": "./dist/services/metadata/index.d.ts",
      "import": "./dist/services/metadata/index.mjs",
      "require": "./dist/services/metadata/index.js"
    }
 * 
 * */
