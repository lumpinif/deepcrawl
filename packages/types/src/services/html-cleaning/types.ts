import type {
  CheerioOptionsSchema,
  ElementPatternSchema,
  HTMLCleaningMetricsSchema,
  HTMLCleaningResultSchema,
  HTMLRewriterOptionsSchema,
  ReaderCleaningOptionsSchema,
  ReaderOptionsSchema,
} from '@deepcrawl/types/schemas';
import type { z } from 'zod/v4';

/**
 * Type representing configuration options for HTML cleaning with the cheerio-reader processor.
 * Only applied when the cleaning processor is set to 'cheerio-reader'.
 *
 * @property {boolean} [debug] - Whether to enable logging
 * @property {number} [maxElemsToParse] - Maximum number of elements to parse (0 = no limit)
 * @property {number} [nbTopCandidates] - Number of top candidates to consider when analyzing competition among candidates
 * @property {number} [charThreshold] - Minimum number of characters an article must have to return a result
 * @property {boolean} [keepClasses] - Whether to preserve all classes on HTML elements
 * @property {string[]} [classesToPreserve] - Classes to preserve when keepClasses is false
 * @property {boolean} [disableJSONLD] - Whether to skip JSON-LD parsing when extracting page metadata
 * @property {RegExp} [allowedVideoRegex] - Regular expression for video URLs allowed in article content
 * @property {number} [linkDensityModifier] - Number added to base link density threshold during shadiness checks
 * @property {boolean} [extraction] - Whether to perform full extraction
 * @property {string} [baseURI] - Base URI for resolving relative URLs
 *
 */
export type ReaderOptions = z.infer<typeof ReaderOptionsSchema>;

/**
 * Type representing Cheerio parser configuration options.
 * Parser-specific options are only recognized if the relevant parser is used.
 *
 * @property {string | URL} [baseURI] - Base URI for resolving href and src properties
 * @property {function | null} [onParseError] - Callback for handling parse errors
 * @property {Record<string, string | function>} [pseudos] - Extension point for pseudo-classes
 * @property {boolean} [quirksMode] - Whether document is in quirks mode (affects case sensitivity)
 * @property {boolean} [scriptingEnabled] - Whether to parse noscript element content as text
 * @property {boolean} [sourceCodeLocationInfo] - Whether to enable source code location information
 * @property {any} [treeAdapter] - Specifies the resulting tree format
 * @property {boolean | Record<string, any>} [xml] - XML parsing configuration
 */
export type CheerioOptions = z.infer<typeof CheerioOptionsSchema>;

/**
 * Type representing combined Cheerio and Readability configuration options for HTML cleaning.
 * Provides comprehensive control over HTML sanitization and cleaning using the cheerio-reader processor.
 *
 * @property {CheerioOptions} [cheerioOptions] - Cheerio parser configuration options
 * @property {ReaderOptions} [readerOptions] - Readability library configuration options
 *
 */
export type ReaderCleaningOptions = z.infer<typeof ReaderCleaningOptionsSchema>;

/**
 * Type representing HTML rewriter cleaning configuration options.
 * Used only with the 'html-rewriter' cleaning processor.
 * Controls which elements are preserved or removed during processing.
 *
 * @property {string[]} [allowedHTMLTags] - HTML tags to preserve (whitelist approach)
 * @property {string[]} [disallowedHTMLTags] - HTML tags to remove (blacklist approach)
 * @property {boolean} [extractMainContent] - Whether to extract only the main content area
 * @property {boolean} [removeBase64Images] - Whether to remove base64 encoded images
 *
 */
export type HTMLRewriterOptions = z.infer<typeof HTMLRewriterOptionsSchema>;

/**
 * Type representing patterns for matching DOM elements during HTML processing.
 * Used to create selectors for targeting specific elements.
 *
 * @property {string | RegExp} [tag] - HTML tag name or pattern to match
 * @property {Array<{name: string | RegExp, value?: string | RegExp}>} [attributes] - Element attributes to match
 * @property {Array<string | RegExp>} [classNames] - CSS class names or patterns to match
 * @property {Array<string | RegExp>} [ids] - Element IDs or patterns to match
 */
export type ElementPattern = z.infer<typeof ElementPatternSchema>;

/**
 * Metrics collected during HTML cleaning and sanitization.
 * Provides insights into the effectiveness of the cleaning process.
 *
 * @property inputSize - Size of input HTML in bytes before cleaning
 * @property outputSize - Size of cleaned HTML in bytes after processing
 * @property compressionRatio - Ratio of output size to input size (lower is better)
 *
 */
export type HTMLCleaningMetrics = z.infer<typeof HTMLCleaningMetricsSchema>;

/**
 * Result of HTML cleaning and sanitization.
 * Contains the processed HTML and optional performance metrics.
 *
 * @property cleanedHtml - Cleaned and sanitized HTML content
 * @property metrics - Optional metrics collected during the cleaning process
 *
 */
export type HTMLCleaningResult = z.infer<typeof HTMLCleaningResultSchema>;
