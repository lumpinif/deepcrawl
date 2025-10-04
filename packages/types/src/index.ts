/**
 * @deepcrawl/types
 *
 * This is the root entry point for the types package.
 * For more specific types, consider importing directly from subpaths:
 *
 * @example
 * // Instead of:
 * import { LinkOptions } from '@deepcrawl/types';
 *
 * // Prefer:
 * import { LinkOptions } from '@deepcrawl/types/routers/link';
 *
 * // Or for service-specific types:
 * import { ScrapedData } from '@deepcrawl/types/services/scrape';
 * import { HTMLRewriterOptions } from '@deepcrawl/types/services/html-cleaning';
 * import { LinkExtractionOptions } from '@deepcrawl/types/services/link';
 * import { PageMetadata } from '@deepcrawl/types/services/metadata';
 */

import type { LinksTree } from './routers/links/types';
export type { LinksTree as Tree };

export * from './common';
export * from './common/response-schemas';
export * from './common/smart-schemas';

export * from './configs';
export * from './configs/default';
export * from './metrics';
export * from './metrics/types';
// Type-only exports for better IDE support
export * from './routers/links';
export * from './routers/links/types';
export * from './routers/logs';
export * from './routers/logs/types';
export * from './routers/read';
export * from './services/cache';
export * from './services/cache/types';
export * from './services/html-cleaning';
export * from './services/html-cleaning/types';
export * from './services/link';
export * from './services/link/types';
export * from './services/markdown';
export * from './services/markdown/types';
export * from './services/metadata';
export * from './services/metadata/types';
export * from './services/scrape';
export * from './services/scrape/types';
