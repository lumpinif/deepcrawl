import {
  smartboolFalse,
  smartboolTrue,
} from '@deepcrawl/types/common/smart-schemas';
import {
  HTMLRewriterOptionsSchema,
  ReaderCleaningOptionsSchema,
} from '@deepcrawl/types/services/html-cleaning/types';
import {
  MetadataOptionsSchema,
  PageMetadataSchema,
} from '@deepcrawl/types/services/metadata/types';
import { z } from 'zod/v4';

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
 * Contains robots.txt and sitemap.xml content.
 *
 * @property robots - Content of the robots.txt file
 * @property sitemapXML - Content of the sitemap.xml file
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
 */
export const ScrapedDataSchema = z
  .object({
    title: z.string().meta({
      description: 'The title of the webpage',
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
 * Represents data scraped from a webpage.
 * Contains various extracted elements and metadata from the target page.
 *
 * @interface ScrapedData
 *
 * @property title - The title of the webpage extracted from the title tag
 * @property rawHTML - The original unmodified HTML content of the webpage
 * @property description - The meta description of the webpage
 * @property metadata - Optional structured metadata extracted from the page (OpenGraph, Twitter Cards, etc.)
 * @property cleanedHtml - Optional sanitized version of the HTML with unnecessary elements removed
 * @property metaFiles - Optional metadata files like robots.txt and sitemap.xml
 *
 * @example
 * ```typescript
 * const scrapedData: ScrapedData = {
 *   title: "Example Website - Home Page",
 *   rawHTML: "<html><head><title>Example Website - Home Page</title></head><body>...</body></html>",
 *   description: "This is an example website demonstrating web scraping capabilities.",
 *   metadata: {
 *     title: "Example Website - Home Page",
 *     description: "This is an example website demonstrating web scraping capabilities.",
 *     ogTitle: "Example Website",
 *     // other metadata properties
 *   },
 *   cleanedHtml: "<div><h1>Example Website</h1><p>Main content...</p></div>",
 *   metaFiles: {
 *     robots: "User-agent: *\nDisallow: /admin/",
 *     sitemap: "<?xml version=\"1.0\"?><urlset>...</urlset>"
 *   }
 * };
 * ```
 */
export type ScrapedData = z.infer<typeof ScrapedDataSchema>;

/**
 * Simple schema for safe HTTP headers.
 * Just explicitly define what's allowed - no complex validation.
 */
export const SafeHeadersSchema = z
  .object({
    /**
     * The user agent string to send with the request.
     */
    'User-Agent': z.string().optional(),
    /**
     * The media types that are acceptable for the response.
     */
    Accept: z.string().optional(),
    /**
     * Preferred languages for the response.
     */
    'Accept-Language': z.string().optional(),
    /**
     * List of acceptable encodings for the response.
     */
    'Accept-Encoding': z.string().optional(),
    /**
     * The address of the previous web page from which a link to the currently requested page was followed.
     */
    Referer: z.string().optional(),
    /**
     * Cookies to send with the request.
     */
    Cookie: z.string().optional(),
    /**
     * Do Not Track preference.
     */
    DNT: z.string().optional(),
    /**
     * Requests a secure connection upgrade.
     */
    'Upgrade-Insecure-Requests': z.string().optional(),
    /**
     * Directives for caching mechanisms in both requests and responses.
     */
    'Cache-Control': z.string().optional(),
    /**
     * Implementation-specific header that may have various effects on caching.
     */
    Pragma: z.string().optional(),
    /**
     * Makes the request conditional: only send the response if the resource has been modified since the given date.
     */
    'If-Modified-Since': z.string().optional(),
    /**
     * Makes the request conditional: only send the response if the resource's ETag does not match any listed.
     */
    'If-None-Match': z.string().optional(),
    /**
     * Indicates the priority for the request.
     */
    Priority: z.string().optional(),
    /**
     * Contains client hints about device and user agent capabilities.
     */
    'Sec-CH-UA': z.string().optional(),
    /**
     * Indicates whether the user agent is a mobile device.
     */
    'Sec-CH-UA-Mobile': z.string().optional(),
    /**
     * Indicates the platform/operating system.
     */
    'Sec-CH-UA-Platform': z.string().optional(),
    /**
     * Indicates the request is from a browser in a secure context.
     */
    'Sec-Fetch-Site': z.string().optional(),
    /**
     * Indicates the request's mode.
     */
    'Sec-Fetch-Mode': z.string().optional(),
    /**
     * Indicates the request's destination.
     */
    'Sec-Fetch-Dest': z.string().optional(),
    /**
     * Indicates whether the request is a user-initiated request.
     */
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
 * Type for safe HTTP headers in scraping requests.
 */
export type SafeHeaders = z.infer<typeof SafeHeadersSchema>;

/**
 * Predefined safe headers for common scraping scenarios.
 */
export const CommonScrapingHeaders = {
  /** Standard browser-like headers - mimics Chrome exactly */
  browserLike: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    DNT: '1',
    'Upgrade-Insecure-Requests': '1',
    'Sec-CH-UA':
      '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-CH-UA-Mobile': '?0',
    'Sec-CH-UA-Platform': '"Windows"',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-User': '?1',
    'Sec-Fetch-Dest': 'document',
    Priority: 'u=0, i',
  },

  /** Minimal bot headers */
  botFriendly: {
    'User-Agent': 'DeepCrawl-Bot/1.0 (+https://deepcrawl.dev)',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  },

  /** Mobile browser headers */
  mobile: {
    'User-Agent':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  },
} as const;

/**
 * Safe schema for fetch request options specifically designed for web scraping.
 * Only includes options that are secure and relevant for scraping operations.
 */
export const FetchOptionsSchema = z
  .object({
    /** HTTP request method - restricted to safe methods for scraping */
    method: z
      .enum(['GET', 'HEAD'])
      .optional()
      .meta({
        description:
          'HTTP request method (only GET and HEAD allowed for scraping)',
        examples: ['GET', 'HEAD'],
      }),

    /** Safe request headers for scraping */
    headers: SafeHeadersSchema.optional().meta({
      description: 'HTTP headers for the request (filtered for security)',
    }),

    /** The redirect mode to use: follow, error, or manual. The default for a new Request object is follow. Note, however, that the incoming Request property of a FetchEvent will have redirect mode manual. */
    redirect: z
      .enum(['follow', 'error', 'manual'])
      .optional()
      .meta({
        description: 'How to handle redirects',
        examples: ['follow', 'error', 'manual'],
      }),

    /** AbortSignal for request cancellation */
    signal: z.instanceof(AbortSignal).nullable().optional().meta({
      description: 'Signal for aborting the request (useful for timeouts)',
    }),
  })
  .meta({
    title: 'FetchOptions',
    description: 'Safe fetch options for web scraping operations',
    examples: [
      {
        method: 'GET',
        headers: CommonScrapingHeaders.browserLike,
        redirect: 'follow',
      },
      {
        method: 'HEAD',
        headers: CommonScrapingHeaders.botFriendly,
        redirect: 'manual',
      },
    ],
  });

/**
 * Type for safe fetch request options specifically designed for web scraping.
 * Only includes options that are secure and relevant for scraping operations.
 */
export type FetchOptions = z.infer<typeof FetchOptionsSchema>;

/**
 * Options for scraping operation.
 * Controls how the scraping operation is performed.
 */
export const ScrapeOptionsSchema = z
  .object({
    /**
     * Whether to extract metadata from the page.
     * Default: true
     */
    metadata: smartboolTrue().meta({
      description: 'Whether to extract metadata from the page.',
      examples: [true],
    }),

    /**
     * Whether to return cleaned HTML.
     * Default: false
     */
    cleanedHtml: smartboolFalse().meta({
      description: 'Whether to return cleaned HTML.',
      examples: [false],
    }),

    /**
     * Whether to fetch and parse robots.txt.
     * Default: false
     */
    robots: smartboolFalse().meta({
      description: 'Whether to fetch and parse robots.txt.',
      examples: [false],
    }),

    /**
     * Whether to fetch and parse sitemap.xml.
     * Default: false
     */
    sitemapXML: smartboolFalse().meta({
      description:
        '( NOTE: sitemapXML is not stable yet, please use with caution. It may not work as expected. ) Whether to fetch and parse sitemap.xml.',
      examples: [false],
    }),

    /**
     * Options for metadata extraction.
     * Controls how metadata like title, description, etc. are extracted.
     */
    metadataOptions: MetadataOptionsSchema.optional(),

    /**
     * The cleaning processor to use.
     * @note cheerio-reader is the default in `scrape.service.ts` and recommended cleaning processor, but html-rewriter is used for github.com urls.
     * Default: 'cheerio-reader'
     */
    cleaningProcessor: z
      .enum(['cheerio-reader', 'html-rewriter'])
      .optional()
      .meta({
        description: 'The cleaning processor to use.',
        examples: ['cheerio-reader', 'html-rewriter'],
      }),

    /**
     * @note only applied when cleaning processor is 'html-rewriter'
     * Options for HTML cleaning with html-rewriter.
     * Controls how HTML is sanitized and cleaned.
     */
    htmlRewriterOptions: HTMLRewriterOptionsSchema.optional().meta({
      description: 'Options for HTML cleaning with html-rewriter.',
      examples: [
        {
          removeScripts: true,
        },
      ],
    }),

    /**
     * @note only applied when cleaning processor is 'cheerio-reader'
     * Options for HTML cleaning with cheerio-reader.
     * Controls how HTML is sanitized and cleaned.
     */
    readerCleaningOptions: ReaderCleaningOptionsSchema.optional().meta({
      description: 'Options for HTML cleaning with cheerio-reader.',
      examples: [
        {
          readerOptions: {
            debug: true,
          },
        },
      ],
    }),

    /**
     * Options for the fetch request.
     */
    fetchOptions: FetchOptionsSchema.optional().meta({
      description: 'Options for the fetch request.',
      examples: [
        {
          method: 'GET',
          headers: CommonScrapingHeaders.botFriendly,
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
 * @note types from `ScrapeOptions` are partial for convenience.
 * Options for scraping operation.
 * Controls how the scraping operation is performed.
 */
export type ScrapeOptions = Partial<z.infer<typeof ScrapeOptionsSchema>>;
