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
 * Options for scraping operation.
 * Controls how the scraping operation is performed.
 */
export type ScrapeOptions = z.infer<typeof ScrapeOptionsSchema>;
