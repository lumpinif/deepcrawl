import { OptionalBoolWithDefault } from '@deepcrawl/types/common/shared-schemas';

import {
  COMMON_HEADERS,
  DEFAULT_FETCH_OPTIONS,
  DEFAULT_HTML_REWRITER_OPTIONS,
  DEFAULT_METADATA_OPTIONS,
  DEFAULT_READER_CLEANING_OPTIONS,
  DEFAULT_SCRAPE_OPTIONS,
} from '@deepcrawl/types/configs';
import {
  HTMLRewriterOptionsSchema,
  ReaderCleaningOptionsSchema,
} from '@deepcrawl/types/services/html-cleaning/types';
import {
  MetadataOptionsSchema,
  PageMetadataSchema,
} from '@deepcrawl/types/services/metadata/types';
import { z } from 'zod/v4';

/**
 * Schema for meta files (robots.txt, sitemap.xml) extracted from a website.
 * Contains the raw content of these important SEO and crawling directive files.
 *
 * @property {string} [robots] - Content of the robots.txt file
 * @property {string} [sitemapXML] - Content of the sitemap.xml file
 *
 * @example
 * ```typescript
 * const metaFiles: MetaFiles = {
 *   robots: "User-agent: *\nDisallow: /private/",
 *   sitemapXML: "<?xml version=\"1.0\"?><urlset>...</urlset>"
 * };
 * ```
 */
export const MetaFilesSchema = z
  .object({
    robots: z
      .string()
      .optional()
      .meta({
        description: 'Content of the robots.txt file',
        examples: ['User-agent: *\nAllow: /'],
      }),
    sitemapXML: z
      .string()
      .optional()
      .meta({
        description: 'Content of the sitemap.xml file',
        examples: [
          '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">...</urlset>',
        ],
      }),
  })
  .meta({
    title: 'MetaFiles',
    description: 'Schema for meta files (robots.txt, sitemap.xml)',
    examples: [
      {
        robots: 'User-agent: *\nAllow: /',
        sitemapXML: [
          '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">...</urlset>',
        ],
      },
    ],
  });

/**
 * Type representing meta files (robots.txt, sitemap.xml) extracted from a website.
 * Contains the raw content of these important SEO and crawling directive files.
 *
 * @property {string} [robots] - Content of the robots.txt file
 * @property {string} [sitemapXML] - Content of the sitemap.xml file
 *
 * @example
 * ```typescript
 * const metaFiles: MetaFiles = {
 *   robots: "User-agent: *\nDisallow: /private/",
 *   sitemapXML: "<?xml version=\"1.0\"?><urlset>...</urlset>"
 * };
 * ```
 */
export type MetaFiles = z.infer<typeof MetaFilesSchema>;

/**
 * Schema for scraped data from a webpage.
 * Defines the structure for all content extracted from a webpage.
 *
 * @property {string} title - Title of the webpage
 * @property {string} rawHtml - Original unmodified HTML content
 * @property {string} [description] - Meta description of the webpage
 * @property {PageMetadata} [metadata] - Extracted metadata from the page
 * @property {string} [cleanedHtml] - Sanitized HTML with unnecessary elements removed
 * @property {MetaFiles} [metaFiles] - Meta files like robots.txt and sitemap.xml
 *
 * @example
 * ```typescript
 * const scrapedData: ScrapedData = {
 *   title: "Example Website - Home Page",
 *   rawHtml: "<html><head><title>Example Website</title></head></html>",
 *   description: "This is an example website",
 *   metadata: {
 *     title: "Example Website",
 *     description: "Example description"
 *   },
 *   cleanedHtml: "<div><h1>Example Website</h1></div>",
 *   metaFiles: {
 *     robots: "User-agent: *\nAllow: /"
 *   }
 * };
 * ```
 */
export const ScrapedDataSchema = z
  .object({
    title: z
      .string()
      .optional()
      .meta({
        description:
          'The title of the webpage (optional, may be missing for some pages)',
        examples: ['Example Website - Home Page'],
      }),
    rawHtml: z.string().meta({
      description: 'The original unmodified HTML content of the webpage',
      examples: [
        '<html><head><title>Example Website - Home Page</title></head><body>...</body></html>',
      ],
    }),
    description: z
      .string()
      .optional()
      .meta({
        description: 'The meta description of the webpage',
        examples: [
          'This is an example website demonstrating web scraping capabilities.',
        ],
      }),
    metadata: PageMetadataSchema.optional().meta({
      title: 'PageMetadata',
      description:
        'Extracted metadata from the page (title, description, etc.)',
    }),
    cleanedHtml: z
      .string()
      .optional()
      .meta({
        description:
          'The sanitized version of the HTML with unnecessary elements removed',
        examples: ['<div><h1>Example Website</h1><p>Main content...</p></div>'],
      }),
    metaFiles: MetaFilesSchema.optional().meta({
      title: 'MetaFiles',
      description: 'The metadata files like robots.txt and sitemap.xml',
    }),
  })
  .meta({
    title: 'ScrapedData',
    description: 'Schema for scraped data from a webpage',
    examples: [
      {
        title: 'Example Website - Home Page',
        rawHtml:
          '<html><head><title>Example Website - Home Page</title></head><body>...</body></html>',
        description:
          'This is an example website demonstrating web scraping capabilities.',
        metadata: {
          title: 'Example Website - Home Page',
          description:
            'This is an example website demonstrating web scraping capabilities.',
          ogTitle: 'Example Website',
          // other metadata properties
        },
        cleanedHtml:
          '<div><h1>Example Website</h1><p>Main content...</p></div>',
        metaFiles: {
          robots: 'User-agent: *\nDisallow: /admin/',
          sitemapXML: '<?xml version="1.0"?><urlset>...</urlset>',
        },
      },
    ],
  });

/**
 * Type representing data scraped from a webpage.
 * Contains various extracted elements and metadata from the target page.
 *
 * @property {string} [title] - Title of the webpage extracted from the title tag (optional, may be missing for some pages)
 * @property {string} rawHtml - Original unmodified HTML content of the webpage
 * @property {string} [description] - Meta description of the webpage
 * @property {PageMetadata} [metadata] - Optional structured metadata extracted from the page
 * @property {string} [cleanedHtml] - Optional sanitized HTML with unnecessary elements removed
 * @property {MetaFiles} [metaFiles] - Optional meta files like robots.txt and sitemap.xml
 *
 * @example
 * ```typescript
 * const scrapedData: ScrapedData = {
 *   title: "Example Website - Home Page",
 *   rawHtml: "<html><head><title>Example Website</title></head></html>",
 *   description: "This is an example website",
 *   metadata: {
 *     title: "Example Website",
 *     description: "Example description"
 *   },
 *   cleanedHtml: "<div><h1>Example Website</h1></div>",
 *   metaFiles: {
 *     robots: "User-agent: *\nDisallow: /admin/"
 *   }
 * };
 * ```
 */
export type ScrapedData = z.infer<typeof ScrapedDataSchema>;

/**
 * Schema for safe HTTP headers used in web scraping requests.
 * Defines only secure and relevant headers for scraping operations.
 *
 * @property {string} [User-Agent] - User agent string for the request
 * @property {string} [Accept] - Media types acceptable for the response
 * @property {string} [Accept-Language] - Preferred languages for the response
 * @property {string} [Accept-Encoding] - Acceptable encodings for the response
 * @property {string} [Referer] - Previous page URL
 * @property {string} [Cookie] - Cookies to send with the request
 * @property {string} [DNT] - Do Not Track preference
 * @property {string} [Upgrade-Insecure-Requests] - Request for secure connection upgrade
 * @property {string} [Cache-Control] - Caching directives
 * @property {string} [Pragma] - Implementation-specific header for caching
 * @property {string} [If-Modified-Since] - Conditional request based on modification date
 * @property {string} [If-None-Match] - Conditional request based on ETag
 * @property {string} [Priority] - Request priority indication
 * @property {string} [Sec-CH-UA] - Client hints about user agent capabilities
 * @property {string} [Sec-CH-UA-Mobile] - Mobile device indication
 * @property {string} [Sec-CH-UA-Platform] - Platform/OS indication
 * @property {string} [Sec-Fetch-Site] - Request origin security context
 * @property {string} [Sec-Fetch-Mode] - Request mode indication
 * @property {string} [Sec-Fetch-Dest] - Request destination indication
 * @property {string} [Sec-Fetch-User] - User-initiated request indication
 *
 * @example
 * ```typescript
 * const headers: SafeHeaders = {
 *   'User-Agent': 'MyBot/1.0',
 *   'Accept': 'text/html,application/xhtml+xml',
 *   'Accept-Language': 'en-US,en;q=0.9'
 * };
 * ```
 */
export const SafeHeadersSchema = z
  .object({
    'User-Agent': z.string().optional(),
    Accept: z.string().optional(),
    'Accept-Language': z.string().optional(),
    'Accept-Encoding': z.string().optional(),
    Referer: z.string().optional(),
    Cookie: z.string().optional(),
    DNT: z.string().optional(),
    'Upgrade-Insecure-Requests': z.string().optional(),
    'Cache-Control': z.string().optional(),
    Pragma: z.string().optional(),
    'If-Modified-Since': z.string().optional(),
    'If-None-Match': z.string().optional(),
    Priority: z.string().optional(),
    'Sec-CH-UA': z.string().optional(),
    'Sec-CH-UA-Mobile': z.string().optional(),
    'Sec-CH-UA-Platform': z.string().optional(),
    'Sec-Fetch-Site': z.string().optional(),
    'Sec-Fetch-Mode': z.string().optional(),
    'Sec-Fetch-Dest': z.string().optional(),
    'Sec-Fetch-User': z.string().optional(),
  })
  .partial()
  .meta({
    title: 'SafeHeaders',
    description: 'Safe HTTP headers for scraping requests',
    examples: [
      {
        'User-Agent': 'MyBot/1.0',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    ],
  });

/**
 * Type representing safe HTTP headers for web scraping requests.
 * Contains only secure and relevant headers for scraping operations.
 *
 * @property {string} [User-Agent] - User agent string for the request
 * @property {string} [Accept] - Media types acceptable for the response
 * @property {string} [Accept-Language] - Preferred languages for the response
 * @property {string} [Accept-Encoding] - Acceptable encodings for the response
 * @property {string} [Referer] - Previous page URL
 * @property {string} [Cookie] - Cookies to send with the request
 * @property {string} [DNT] - Do Not Track preference
 * @property {string} [Upgrade-Insecure-Requests] - Request for secure connection upgrade
 * @property {string} [Cache-Control] - Caching directives
 * @property {string} [Pragma] - Implementation-specific header for caching
 * @property {string} [If-Modified-Since] - Conditional request based on modification date
 * @property {string} [If-None-Match] - Conditional request based on ETag
 * @property {string} [Priority] - Request priority indication
 * @property {string} [Sec-CH-UA] - Client hints about user agent capabilities
 * @property {string} [Sec-CH-UA-Mobile] - Mobile device indication
 * @property {string} [Sec-CH-UA-Platform] - Platform/OS indication
 * @property {string} [Sec-Fetch-Site] - Request origin security context
 * @property {string} [Sec-Fetch-Mode] - Request mode indication
 * @property {string} [Sec-Fetch-Dest] - Request destination indication
 * @property {string} [Sec-Fetch-User] - User-initiated request indication
 *
 * @example
 * ```typescript
 * const headers: SafeHeaders = {
 *   'User-Agent': 'MyBot/1.0',
 *   'Accept': 'text/html,application/xhtml+xml',
 *   'Accept-Language': 'en-US,en;q=0.9'
 * };
 * ```
 */
export type SafeHeaders = z.infer<typeof SafeHeadersSchema>;

/**
 * Schema for fetch request options specifically designed for web scraping.
 * Only includes options that are secure and relevant for scraping operations.
 *
 * @property {'GET' | 'HEAD'} [method] - HTTP request method (restricted to safe methods)
 * @property {SafeHeaders} [headers] - HTTP headers for the request (filtered for security)
 * @property {'follow' | 'error' | 'manual'} [redirect] - How to handle redirects
 * @property {AbortSignal} [signal] - Signal for aborting the request (useful for timeouts)
 *
 * @example
 * ```typescript
 * const options: FetchOptions = {
 *   method: 'GET',
 *   headers: {
 *     'User-Agent': 'MyBot/1.0',
 *     'Accept': 'text/html'
 *   },
 *   redirect: 'follow'
 * };
 * ```
 */
export const FetchOptionsSchema = z
  .object({
    method: z
      .enum(['GET', 'HEAD'])
      .optional()
      .meta({
        description:
          'HTTP request method (only GET and HEAD allowed for scraping)',
        examples: ['GET', 'HEAD'],
      }),
    headers: SafeHeadersSchema.optional().meta({
      description: 'HTTP headers for the request (filtered for security)',
    }),
    redirect: z
      .enum(['follow', 'error', 'manual'])
      .optional()
      .meta({
        description: 'How to handle redirects',
        examples: ['follow', 'error', 'manual'],
      }),
    signal: z.instanceof(AbortSignal).nullable().optional().meta({
      description: 'Signal for aborting the request (useful for timeouts)',
    }),
  })
  .default(DEFAULT_FETCH_OPTIONS)
  .meta({
    title: 'FetchOptions',
    description: 'Safe fetch options for web scraping operations',
    examples: [
      {
        method: 'GET',
        headers: COMMON_HEADERS.browserLike,
        redirect: 'follow',
      },
      {
        method: 'HEAD',
        headers: COMMON_HEADERS.botFriendly,
        redirect: 'manual',
      },
    ],
  });

/**
 * Type representing fetch request options for web scraping operations.
 * Only includes options that are secure and relevant for scraping.
 *
 * @property {'GET' | 'HEAD'} [method] - HTTP request method (restricted to safe methods)
 * @property {SafeHeaders} [headers] - HTTP headers for the request (filtered for security)
 * @property {'follow' | 'error' | 'manual'} [redirect] - How to handle redirects
 * @property {AbortSignal} [signal] - Signal for aborting the request (useful for timeouts)
 *
 * @example
 * ```typescript
 * const options: FetchOptions = {
 *   method: 'GET',
 *   headers: {
 *     'User-Agent': 'MyBot/1.0',
 *     'Accept': 'text/html'
 *   },
 *   redirect: 'follow'
 * };
 * ```
 */
export type FetchOptions = z.infer<typeof FetchOptionsSchema>;

const { metadata, cleanedHtml, robots, sitemapXML, cleaningProcessor } =
  DEFAULT_SCRAPE_OPTIONS;

/**
 * Schema for scraping operation configuration options.
 * Controls how the scraping operation is performed and what data is extracted.
 *
 * @property {boolean} [metadata] - Whether to extract metadata from the page
 * @property {boolean} [cleanedHtml] - Whether to return cleaned HTML
 * @property {boolean} [robots] - Whether to fetch and parse robots.txt
 * @property {boolean} [sitemapXML] - Whether to fetch and parse sitemap.xml (experimental)
 * @property {MetadataOptions} [metadataOptions] - Options for metadata extraction
 * @property {'cheerio-reader' | 'html-rewriter'} [cleaningProcessor] - The cleaning processor to use
 * @property {HTMLRewriterOptions} [htmlRewriterOptions] - Options for HTML cleaning with html-rewriter
 * @property {ReaderCleaningOptions} [readerCleaningOptions] - Options for HTML cleaning with cheerio-reader
 * @property {FetchOptions} [fetchOptions] - Options for the fetch request
 *
 * @example
 * ```typescript
 * const options: ScrapeOptions = {
 *   metadata: true,
 *   cleanedHtml: true,
 *   robots: false,
 *   cleaningProcessor: 'cheerio-reader',
 *   fetchOptions: {
 *     method: 'GET',
 *     headers: { 'User-Agent': 'MyBot/1.0' }
 *   }
 * };
 * ```
 */
export const ScrapeOptionsSchema = z
  .object({
    metadata: OptionalBoolWithDefault(metadata).meta({
      description: 'Whether to extract metadata from the page.',
      default: metadata,
      examples: [metadata, !metadata],
    }),
    cleanedHtml: OptionalBoolWithDefault(cleanedHtml).meta({
      description: 'Whether to return cleaned HTML.',
      default: cleanedHtml,
      examples: [cleanedHtml, !cleanedHtml],
    }),
    robots: OptionalBoolWithDefault(robots).meta({
      description: 'Whether to fetch and parse robots.txt.',
      default: robots,
      examples: [robots, !robots],
    }),
    sitemapXML: OptionalBoolWithDefault(sitemapXML).meta({
      description:
        '( NOTE: sitemapXML is not stable yet, please use with caution. It may not work as expected. ) Whether to fetch and parse sitemap.xml.',
      default: sitemapXML,
      examples: [sitemapXML, !sitemapXML],
    }),
    metadataOptions: MetadataOptionsSchema.optional().meta({
      description: 'Options for metadata extraction.',
      default: DEFAULT_METADATA_OPTIONS,
      examples: [DEFAULT_METADATA_OPTIONS],
    }),
    cleaningProcessor: z
      .enum(['cheerio-reader', 'html-rewriter'])
      .default(cleaningProcessor)
      .optional()
      .meta({
        default: cleaningProcessor,
        description: 'The cleaning processor to use.',
        examples: ['cheerio-reader', 'html-rewriter'],
      }),
    htmlRewriterOptions: HTMLRewriterOptionsSchema.optional().meta({
      description: 'Options for HTML cleaning with html-rewriter.',
      default: DEFAULT_HTML_REWRITER_OPTIONS,
      examples: [DEFAULT_HTML_REWRITER_OPTIONS],
    }),
    readerCleaningOptions: ReaderCleaningOptionsSchema.optional().meta({
      description: 'Options for HTML cleaning with cheerio-reader.',
      default: DEFAULT_READER_CLEANING_OPTIONS,
      examples: [
        {
          readerOptions: {
            debug: true,
            ...DEFAULT_READER_CLEANING_OPTIONS.readerOptions,
          },
          ...DEFAULT_READER_CLEANING_OPTIONS.cheerioOptions,
        },
      ],
    }),
    fetchOptions: FetchOptionsSchema.optional().meta({
      description: 'Options for the fetch request.',
      default: DEFAULT_FETCH_OPTIONS,
      examples: [
        {
          method: 'GET',
          headers: COMMON_HEADERS.botFriendly,
          redirect: 'follow',
        },
      ],
    }),
  })
  .meta({
    title: 'ScrapeOptions',
    description: 'Configuration options for scraping operation',
    examples: [
      {
        metadata: true,
        cleanedHtml: false,
        robots: false,
        sitemapXML: false,
        metadataOptions: {
          title: true,
        },
        cleaningProcessor: 'cheerio-reader',
        readerCleaningOptions: {
          readerOptions: {
            debug: true,
          },
        },
        cheerioOptions: {
          baseURI: 'https://example.com',
          quirksMode: false,
          scriptingEnabled: true,
          sourceCodeLocationInfo: false,
          treeAdapter: 'treeAdapters.default',
          xml: false,
        },
      },
    ],
  });

/**
 * Type representing scraping operation configuration options.
 * Controls how the scraping operation is performed and what data is extracted.
 * All options are optional and have sensible defaults.
 *
 * @property {boolean} [metadata] - Whether to extract metadata from the page
 * @property {boolean} [cleanedHtml] - Whether to return cleaned HTML
 * @property {boolean} [robots] - Whether to fetch and parse robots.txt
 * @property {boolean} [sitemapXML] - Whether to fetch and parse sitemap.xml (experimental)
 * @property {MetadataOptions} [metadataOptions] - Options for metadata extraction
 * @property {'cheerio-reader' | 'html-rewriter'} [cleaningProcessor] - The cleaning processor to use
 * @property {HTMLRewriterOptions} [htmlRewriterOptions] - Options for HTML cleaning with html-rewriter
 * @property {ReaderCleaningOptions} [readerCleaningOptions] - Options for HTML cleaning with cheerio-reader
 * @property {FetchOptions} [fetchOptions] - Options for the fetch request
 *
 * @example
 * ```typescript
 * const options: ScrapeOptions = {
 *   metadata: true,
 *   cleanedHtml: true,
 *   robots: false,
 *   cleaningProcessor: 'cheerio-reader',
 *   fetchOptions: {
 *     method: 'GET',
 *     headers: { 'User-Agent': 'MyBot/1.0' }
 *   }
 * };
 * ```
 */
export type ScrapeOptions = z.infer<typeof ScrapeOptionsSchema>;

// @DEPRECATED AS WE REMOVED SMARTBOOL
// /**
//  * Input type for ScrapeOptions that accepts both string and boolean values for smart boolean fields.
//  * This type allows for flexible input where boolean options can be provided as strings ('true'/'false') or booleans.
//  *
//  * @property {boolean | string} [metadata] - Whether to extract metadata (accepts 'true'/'false' or boolean)
//  * @property {boolean | string} [cleanedHtml] - Whether to return cleaned HTML (accepts 'true'/'false' or boolean)
//  * @property {boolean | string} [robots] - Whether to fetch robots.txt (accepts 'true'/'false' or boolean)
//  * @property {boolean | string} [sitemapXML] - Whether to fetch sitemap.xml (accepts 'true'/'false' or boolean)
//  * @property {MetadataOptions} [metadataOptions] - Options for metadata extraction
//  * @property {'cheerio-reader' | 'html-rewriter'} [cleaningProcessor] - The cleaning processor to use
//  * @property {HTMLRewriterOptions} [htmlRewriterOptions] - Options for HTML cleaning with html-rewriter
//  * @property {ReaderCleaningOptions} [readerCleaningOptions] - Options for HTML cleaning with cheerio-reader
//  * @property {FetchOptions} [fetchOptions] - Options for the fetch request
//  *
//  * @example
//  * ```typescript
//  * const options: ScrapeOptionsInput = {
//  *   metadata: 'true',     // String boolean
//  *   cleanedHtml: true,    // Regular boolean
//  *   robots: 'false',      // String boolean
//  *   cleaningProcessor: 'cheerio-reader'
//  * };
//  * ```
//  */
// export type ScrapeOptions = z.input<typeof ScrapeOptionsSchema>;
