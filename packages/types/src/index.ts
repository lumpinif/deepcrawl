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
 * import { ScrapedData } from '@deepcrawl/types/services/cheerio';
 * import { HTMLCleaningOptions } from '@deepcrawl/types/services/html-cleaning';
 * import { LinkExtractionOptions } from '@deepcrawl/types/services/link';
 * import { PageMetadata } from '@deepcrawl/types/services/metadata';
 */

// Export a services object for discoverability
import * as CheerioTypes from "./services/cheerio/types";
import * as HTMLCleaningTypes from "./services/html-cleaning/types";
import * as LinkServiceTypes from "./services/link/types";
import * as MetadataTypes from "./services/metadata/types";

// Re-export router types for better discoverability
import * as LinksRouterTypes from "./routers/links/types";

import type { LinksTree } from "./routers/links/types";
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
};

// Type-only exports for better IDE support
export * as CheerioTypes from "./services/cheerio/types";
export * as HTMLCleaningTypes from "./services/html-cleaning/types";
export * as LinkServiceTypes from "./services/link/types";
export * as MetadataTypes from "./services/metadata/types";
export * as LinksRouterTypes from "./routers/links/types";

export * from "./routers/links/index";
export * from "./routers/read/index";
export * from "./services/cheerio/index";
export * from "./services/html-cleaning/index";
export * from "./services/link/index";
export * from "./services/metadata/index";
