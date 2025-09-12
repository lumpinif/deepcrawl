import { BaseErrorResponseSchema } from '@deepcrawl/types/common/response-schemas';
import { smartboolOptionalWithDefault } from '@deepcrawl/types/common/smart-schemas';
import {
  DEFAULT_CACHE_OPTIONS,
  DEFAULT_LINK_EXTRACTION_OPTIONS,
  DEFAULT_LINKS_OPTIONS,
  DEFAULT_TREE_OPTIONS,
} from '@deepcrawl/types/configs';
import { MetricsOptionsSchema, MetricsSchema } from '@deepcrawl/types/metrics';
import { CacheOptionsSchema } from '@deepcrawl/types/services/cache/types';

import {
  ExtractedLinksSchema,
  LinkExtractionOptionsSchema,
} from '@deepcrawl/types/services/link/types';
import { PageMetadataSchema } from '@deepcrawl/types/services/metadata/types';
import {
  ScrapedDataSchema,
  ScrapeOptionsSchema,
} from '@deepcrawl/types/services/scrape/types';
import { z } from 'zod/v4';

const {
  folderFirst,
  linksOrder,
  extractedLinks,
  subdomainAsRootUrl,
  isPlatformUrl,
} = DEFAULT_TREE_OPTIONS;

/**
 * Schema for links order enum.
 * Defines how links should be ordered within folders.
 */
export const LinksOrderSchema = z
  .enum(['page', 'alphabetical'])
  .default(linksOrder)
  .meta({
    title: 'LinksOrder',
    description:
      'How to order links within each folder: "page" (preserve original order) or "alphabetical" (sort A→Z by URL).',
    default: linksOrder,
    examples: ['alphabetical', 'page'],
  });

/**
 * Type representing the order of links within each folder.
 * @enum {string} 'page' | 'alphabetical'
 * @see {@link LinksOrderSchema}
 * @example
 * ```typescript
 * const linksOrder: LinksOrder = 'alphabetical';
 * ```
 */
export type LinksOrder = z.infer<typeof LinksOrderSchema>;

/**
 * Schema for tree options.
 * Defines options for building a site map tree.
 *
 * @property {boolean} [folderFirst] - Whether to place folders before leaf nodes in the tree
 * @property {'page'|'alphabetical'} [linksOrder] - How to order links within each folder
 * @property {boolean} [extractedLinks] - Whether to include extracted links for each node in the tree
 * @property {boolean} [subdomainAsRootUrl] - Whether to treat subdomain as root URL
 * @property {boolean} [isPlatformUrl] - Whether the URL is a platform URL
 */
export const TreeOptionsSchema = z
  .object({
    /**
     * Whether to place folders before leaf nodes in the tree.
     * Default: true
     */
    folderFirst: smartboolOptionalWithDefault(folderFirst).meta({
      description: `Whether to place folders before leaf nodes in the tree. Default: ${folderFirst}`,
      default: folderFirst,
      examples: [folderFirst, !folderFirst],
    }),
    /**
     * @see {@link LinksOrderSchema}
     * How to order links within each folder:
     *  - 'page'        preserve the original document order
     *  - 'alphabetical'  sort A→Z by URL
     * Default: 'page'
     */
    linksOrder: LinksOrderSchema.optional().meta({
      description: `How to order links within each folder: "page" (preserve original order) or "alphabetical" (sort A→Z by URL). Default: ${linksOrder}`,
      default: linksOrder,
      examples: ['alphabetical', 'page'],
    }),

    /**
     * Whether to include extracted links for each node in the tree.
     * Default: true
     */
    extractedLinks: smartboolOptionalWithDefault(extractedLinks).meta({
      description: `Whether to include extracted links for each node in the tree. Default: ${extractedLinks}`,
      default: extractedLinks,
      examples: [extractedLinks, !extractedLinks],
    }),

    /**
     * Whether to exclude subdomain as root URL.
     * Default: true
     * e.g., if false: rootUrl: https://swr.vercel.app -> https://vercel.app
     */
    subdomainAsRootUrl: smartboolOptionalWithDefault(subdomainAsRootUrl).meta({
      description: `Whether to treat subdomain as root URL. If false, subdomain will be excluded from root URL. e.g., if false: rootUrl: \`https://swr.vercel.app\` -> \`https://vercel.app\`. Default: ${subdomainAsRootUrl}`,
      default: subdomainAsRootUrl,
      examples: [subdomainAsRootUrl, !subdomainAsRootUrl],
    }),

    /**
     * Whether the URL is a platform URL.
     * Default: false
     * e.g., if the root URL is a platform URL, e.g., like github.com
     * This will be used to determine the root URL of the website. For example, if the root URL is a platform URL, e.g., like github.com, the targetUrl will be the platform URL such as `https://github.com/lumpinif`. If the root URL is not a platform URL, the targetUrl will be the root URL.
     */
    isPlatformUrl: smartboolOptionalWithDefault(isPlatformUrl).meta({
      description: `Whether the URL is a platform URL. If true, the targetUrl will be the platform URL. e.g., if true: targetUrl: \`https://github.com\` -> \`https://github.com/lumpinif\`. Default: ${isPlatformUrl}`,
      default: isPlatformUrl,
      examples: [isPlatformUrl, !isPlatformUrl],
    }),
  })
  .meta({
    title: 'TreeOptions',
    description: 'Options for building a site map tree',
    examples: [DEFAULT_TREE_OPTIONS],
  });

/**
 * Type representing the options for building a site map tree.
 * @see {@link TreeOptionsSchema}
 *
 * @example
 * ```typescript
 * const options = {
 *   folderFirst: true,
 *   linksOrder: 'alphabetical',
 *   extractedLinks: true,
 *   subdomainAsRootUrl: true,
 *   isPlatformUrl: false,
 * };
 *
 * ```
 */
export type TreeOptions = z.infer<typeof TreeOptionsSchema>;

const { tree, metricsOptions } = DEFAULT_LINKS_OPTIONS;

/**
 * Schema for links route options.
 * Defines the configuration for a links operation.
 *
 * @property {string} url - The URL to extract links from
 * @property {boolean} [tree] - Whether to build a site map tree
 * @property {Object} [linkExtractionOptions] - Options for link extraction
 * @property {Object} [cacheOptions] - Cache configuration for links operation
 * @property {Object} [metricsOptions] - Options for metrics for links operation
 * @property {boolean} [folderFirst] - Whether to place folders before leaf nodes in the tree
 * @property {'page'|'alphabetical'} [linksOrder] - How to order links within each folder
 * @property {boolean} [extractedLinks] - Whether to include extracted links for each node in the tree
 * @property {boolean} [subdomainAsRootUrl] - Whether to treat subdomain as root URL
 * @property {boolean} [isPlatformUrl] - Whether the URL is a platform URL
 * @property {boolean} [metadata] - Whether to extract metadata from the page
 * @property {boolean} [cleanedHtml] - Whether to return cleaned HTML
 * @property {boolean} [robots] - Whether to fetch and parse robots.txt
 * @property {boolean} [sitemapXML] - Whether to fetch and parse sitemap.xml
 * @property {Object} [metadataOptions] - Options for metadata extraction
 * @property {'cheerio-reader'|'html-rewriter'} [cleaningProcessor] - The cleaning processor to use
 * @property {Object} [htmlRewriterOptions] - Options for HTML cleaning with html-rewriter
 * @property {Object} [readerCleaningOptions] - Options for HTML cleaning with cheerio-reader
 * @property {Object} [fetchOptions] - Options for the fetch request
 *
 *
 * @example
 * ```typescript
 * const options = {
 *   url: "https://example.com",
 *   tree: true,
 *   metadata: true,
 *   cleanedHtml: false,
 *   subdomainAsRootUrl: true,
 *   isPlatformUrl: false,
 * };
 * ```
 */
export const LinksOptionsSchema = z
  .object({
    /**
     * The URL to extract links from.
     * Must be a valid URL string.
     */
    url: z.string().meta({
      description: 'The URL to extract links from. Must be a valid URL string.',
      examples: ['https://example.com', 'example.com'],
    }),

    /**
     * Whether to build a site map tree.
     * Default: true
     */
    tree: smartboolOptionalWithDefault(tree).meta({
      description: `Whether to build a site map tree. Default: ${tree}`,
      default: tree,
      examples: [tree, !tree],
    }),

    /**
     * Options for link extraction.
     * Controls how links are extracted and categorized.
     * @see {@link LinkExtractionOptionsSchema}
     * @see Default: {@link DEFAULT_LINK_EXTRACTION_OPTIONS}
     */
    linkExtractionOptions: LinkExtractionOptionsSchema.optional().meta({
      title: 'LinkExtractionOptions',
      description: `Options for link extraction. Default: ${DEFAULT_LINK_EXTRACTION_OPTIONS}`,
      default: DEFAULT_LINK_EXTRACTION_OPTIONS,
      examples: [DEFAULT_LINK_EXTRACTION_OPTIONS],
    }),

    /**
     * Cache configuration for links operation based on KV put options except for `metadata`.
     * An object containing the `expiration` (optional) and `expirationTtl` (optional) attributes
     * @see https://developers.cloudflare.com/kv/api/write-key-value-pairs/#put-method
     * @see Default: {@link DEFAULT_CACHE_OPTIONS}
     */
    cacheOptions: CacheOptionsSchema.optional().meta({
      description:
        'Cache configuration for links operation based on KV put options except for `metadata`',
      default: DEFAULT_CACHE_OPTIONS,
      examples: [DEFAULT_CACHE_OPTIONS],
    }),

    /* Options for metrics */
    metricsOptions: MetricsOptionsSchema.optional().meta({
      description: 'Options for metrics for links operation.',
      default: metricsOptions,
      examples: [metricsOptions, !metricsOptions],
    }),
  })
  .extend(TreeOptionsSchema.shape)
  .extend(ScrapeOptionsSchema.shape)
  .meta({
    title: 'LinksOptions',
    description: 'Configuration options for links extraction operation',
    examples: [
      {
        url: 'https://example.com',
        tree: true,
      },
    ],
  });

export const SkippedUrlSchema = z
  .object({
    url: z.string().meta({
      description: 'The URL that was skipped during processing',
      examples: ['https://example.com/private-page'],
    }),
    reason: z.string().meta({
      description: 'The reason why this URL was skipped',
      examples: ['Blocked by robots.txt'],
    }),
  })
  .meta({
    title: 'SkippedUrl',
    description: 'A URL that was skipped during processing with the reason',
    examples: [
      {
        url: 'https://example.com/private-page',
        reason: 'Blocked by robots.txt',
      },
    ],
  });

export const VisitedUrlSchema = z
  .object({
    url: z.string().meta({
      description: 'The URL that was visited',
      examples: ['https://example.com/about'],
    }),
    lastVisited: z
      .string()
      .nullable()
      .optional()
      .meta({
        description: 'ISO timestamp when this URL was last visited',
        examples: ['2024-01-15T10:30:00.000Z'],
      }),
  })
  .meta({
    title: 'VisitedUrl',
    description: 'A URL that has been visited with timestamp information',
  });

export const SkippedLinksSchema = z
  .object({
    internal: z
      .array(SkippedUrlSchema)
      .optional()
      .meta({
        description: 'Internal URLs that were skipped during processing',
        examples: [
          {
            url: 'https://example.com/admin',
            reason: 'Blocked by robots.txt',
          },
        ],
      }),
    external: z
      .array(SkippedUrlSchema)
      .optional()
      .meta({
        description: 'External URLs that were skipped during processing',
        examples: [
          {
            url: 'https://external-site.com/blocked',
            reason: 'External domain excluded',
          },
        ],
      }),
    media: z
      .object({
        images: z
          .array(SkippedUrlSchema)
          .optional()
          .meta({
            description: 'Image URLs that were skipped during processing',
            examples: [
              {
                url: 'https://example.com/large-image.jpg',
                reason: 'File size exceeds limit',
              },
            ],
          }),
        videos: z
          .array(SkippedUrlSchema)
          .optional()
          .meta({
            description: 'Video URLs that were skipped during processing',
            examples: [
              {
                url: 'https://example.com/video.mp4',
                reason: 'Media extraction disabled',
              },
            ],
          }),
        documents: z
          .array(SkippedUrlSchema)
          .optional()
          .meta({
            description: 'Document URLs that were skipped during processing',
            examples: [
              {
                url: 'https://example.com/document.pdf',
                reason: 'PDF processing disabled',
              },
            ],
          }),
      })
      .optional()
      .meta({
        description: 'Media URLs that were skipped during processing',
      }),
    other: z
      .array(SkippedUrlSchema)
      .optional()
      .meta({
        description: 'Other URLs that were skipped during processing',
        examples: [
          {
            url: 'mailto:contact@example.com',
            reason: 'Non-HTTP protocol',
          },
        ],
      }),
  })
  .meta({
    title: 'SkippedLinks',
    description:
      'Categorized collection of URLs that were skipped during processing',
    examples: [
      {
        internal: [
          {
            url: 'https://example.com/admin',
            reason: 'Blocked by robots.txt',
          },
          {
            url: 'https://example.com/private',
            reason: 'Requires authentication',
          },
        ],
        external: [
          {
            url: 'https://external-site.com/blocked',
            reason: 'External domain excluded',
          },
        ],
        media: {
          images: [
            {
              url: 'https://example.com/large-image.jpg',
              reason: 'File size exceeds limit',
            },
          ],
          videos: [
            {
              url: 'https://example.com/video.mp4',
              reason: 'Media extraction disabled',
            },
          ],
          documents: [
            {
              url: 'https://example.com/document.pdf',
              reason: 'PDF processing disabled',
            },
          ],
        },
        other: [
          {
            url: 'mailto:contact@example.com',
            reason: 'Non-HTTP protocol',
          },
        ],
      },
    ],
  });

/**
 * @name  LinksTree  can be imported as `LinksTree` or `Tree`
 * @description Represents a node in the site map tree.
 * Each node contains information about a URL and its child pages.
 *
 * @property {string} url - The URL of this node
 * @property {string} [rootUrl] - The root URL of the website
 * @property {string} [name] - The name of this node
 * @property {number} [totalUrls] - Total number of URLs in the tree
 * @property {string} lastUpdated - ISO timestamp when this node was last updated
 * @property {string|null} [lastVisited] - ISO timestamp when this URL was last visited
 * @property {LinksTree[]} [children] - Child pages of this URL
 * @property {string} [error] - Error message if there was an issue processing this URL
 * @property {Object} [metadata] - Metadata extracted from the page
 * @property {string} [cleanedHtml] - Cleaned HTML content of the page
 * @property {Object} [extractedLinks] - Extracted links from the page
 * @property {Object} [skippedUrls] - URLs that were skipped during processing
 *
 * @example
 * ```typescript
 * const treeNode: LinksTree = {
 *   url: "https://example.com",
 *   rootUrl: "https://example.com",
 *   name: "example",
 *   totalUrls: 10,
 *   lastUpdated: "2025-04-02T14:28:23.000Z",
 *   lastVisited: "2025-04-02T14:28:23.000Z",
 *   children: [
 *     {
 *       url: "https://example.com/about",
 *       name: "about",
 *       lastUpdated: "2025-04-01T10:15:30.000Z",
 *       lastVisited: "2025-04-02T14:28:25.000Z"
 *     }
 *   ],
 *   metadata: {
 *     title: "Example Website",
 *     description: "This is an example website"
 *   },
 *   extractedLinks: {
 *     internal: [
 *       'https://example.com/about',
 *       'https://example.com/contact'
 *     ],
 *     external: [
 *       'https://othersite.com/reference',
 *       'https://api.example.org/data'
 *     ],
 *     media: {
 *       images: [
 *         'https://example.com/images/logo.png',
 *         'https://example.com/images/banner.jpg'
 *       ],
 *       videos: [
 *         'https://example.com/videos/intro.mp4'
 *       ],
 *       documents: [
 *         'https://example.com/docs/whitepaper.pdf'
 *       ]
 *     }
 *   },
 *   skippedUrls: {
 *     internal: [
 *       { url: "https://example.com/private", reason: "Blocked by robots.txt" }
 *     ],
 *     external: [
 *       { url: "https://othersite.com", reason: "External domain" }
 *     ]
 *   }
 * };
 * ```
 */
export type LinksTree = z.infer<typeof LinksTreeSchema>;

export const LinksTreeSchema = z
  .object({
    // Inline all properties for better OpenAPI documentation display
    url: z.string().meta({
      description: 'The URL of this page',
      examples: ['https://example.com/about'],
    }),
    /* The root URL of the website being crawled */
    rootUrl: z
      .string()
      .optional()
      .meta({
        description: 'The root URL of the website being crawled',
        examples: ['https://example.com'],
      }),
    /* The display name or title of this page */
    name: z
      .string()
      .optional()
      .meta({
        description: 'The display name or title of this page',
        examples: ['About Us'],
      }),
    /* Total number of URLs discovered in the entire tree */
    totalUrls: z
      .number()
      .optional()
      .meta({
        description: 'Total number of URLs discovered in the entire tree',
        examples: [150],
      }),
    /* ISO timestamp when this page was last crawled */
    lastUpdated: z.string().meta({
      description: 'ISO timestamp when this page was last crawled',
      examples: ['2024-01-15T10:30:00.000Z'],
    }),
    /* ISO timestamp when this page was last visited */
    lastVisited: z
      .string()
      .nullable()
      .optional()
      .meta({
        description:
          'ISO timestamp when this page was last visited (null if never visited)',
        examples: ['2024-01-15T10:30:00.000Z'],
      }),
    /* Error message if there was an issue processing this page */
    error: z
      .string()
      .optional()
      .meta({
        description: 'Error message if there was an issue processing this page',
        examples: ['Failed to fetch: 404 Not Found'],
      }),
    /* Extracted metadata from the page (title, description, etc.) */
    metadata: PageMetadataSchema.optional().meta({
      title: 'PageMetadata',
      description:
        'Extracted metadata from the page (title, description, etc.)',
    }),
    /* Cleaned HTML content of the page */
    cleanedHtml: z.string().optional().meta({
      description: 'Cleaned HTML content of the page',
    }),
    /* Links found on this page, categorized by type */
    extractedLinks: ExtractedLinksSchema.optional().meta({
      title: 'ExtractedLinks',
      description: 'Links found on this page, categorized by type',
    }),
    /* URLs that were skipped during processing with reasons */
    skippedUrls: SkippedLinksSchema.optional().meta({
      title: 'SkippedLinks',
      description: 'URLs that were skipped during processing with reasons',
    }),
    /* Array of child LinksTree nodes, each representing a page found under this URL. This creates a recursive tree structure for the entire website hierarchy. */
    get children(): z.ZodOptional<z.ZodArray<typeof LinksTreeSchema>> {
      return z
        .array(LinksTreeSchema)
        .optional()
        .meta({
          title: 'LinksTree',
          description:
            'Array of child LinksTree nodes, each representing a page found under this URL. This creates a recursive tree structure for the entire website hierarchy.',
          examples: [
            {
              url: 'https://example.com/about/team',
              name: 'Team',
              lastUpdated: '2024-01-15T10:35:00.000Z',
              children: [],
            },
            {
              url: 'https://example.com/about/history',
              name: 'History',
              lastUpdated: '2024-01-15T10:36:00.000Z',
              children: [
                {
                  url: 'https://example.com/about/history/founding',
                  name: 'Company Founding',
                  lastUpdated: '2024-01-15T10:37:00.000Z',
                },
              ],
            },
          ],
        });
    },
  })
  .meta({
    title: 'LinksTree',
    description:
      'A node in the site map tree representing a webpage and its children',
    examples: [
      {
        url: 'https://example.com/about',
        rootUrl: 'https://example.com',
        name: 'About Us',
        totalUrls: 150,
        lastUpdated: '2024-01-15T10:30:00.000Z',
        lastVisited: '2024-01-15T10:30:00.000Z',
        metadata: {
          title: 'About Us - Example Company',
          description: 'Learn more about our company history and mission.',
          language: 'en',
          canonical: 'https://example.com/about',
          robots: 'index,follow',
          author: 'Example Company',
          keywords: ['about', 'company', 'history'],
          favicon: 'https://example.com/favicon.ico',
          ogTitle: 'About Us - Example Company',
          ogDescription: 'Learn more about our company history and mission.',
          ogImage: 'https://example.com/og-about.jpg',
          ogUrl: 'https://example.com/about',
          twitterCard: 'summary_large_image',
          twitterTitle: 'About Us - Example Company',
          twitterDescription:
            'Learn more about our company history and mission.',
          twitterImage: 'https://example.com/twitter-about.jpg',
          isIframeAllowed: true,
        },
        extractedLinks: {
          internal: [
            'https://example.com/about/team',
            'https://example.com/about/history',
            'https://example.com/contact',
          ],
          external: [
            'https://partner-company.com',
            'https://industry-association.org',
          ],
          media: {
            images: [
              'https://example.com/images/office-photo.jpg',
              'https://example.com/images/team-photo.jpg',
            ],
            videos: ['https://example.com/videos/company-intro.mp4'],
            documents: ['https://example.com/files/company-brochure.pdf'],
          },
        },
        children: [
          {
            url: 'https://example.com/about/team',
            name: 'Our Team',
            lastUpdated: '2024-01-15T10:35:00.000Z',
            children: [],
          },
          {
            url: 'https://example.com/about/history',
            name: 'Company History',
            lastUpdated: '2024-01-15T10:36:00.000Z',
            children: [
              {
                url: 'https://example.com/about/history/founding',
                name: 'Company Founding',
                lastUpdated: '2024-01-15T10:37:00.000Z',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  });

const LinksResponseBaseSchema = z.object({
  /* Indicates whether the operation was successful */
  success: z.boolean().meta({
    description: 'Indicates whether the operation was successful',
  }),
  /* The URL that was requested to be processed */
  targetUrl: z.string().meta({
    description: 'The URL that was requested to be processed',
    examples: ['https://example.com'],
  }),
  /* ISO timestamp when the request was processed */
  timestamp: z.string().meta({
    description: 'ISO timestamp when the request was processed',
    examples: ['2024-01-15T10:30:00.000Z'],
  }),
});

/* NOTE: use partial() to make all properties optional for /links response for better response shape such as not returning title and description if there is tree */
const PartialScrapedDataSchema = ScrapedDataSchema.partial().omit({
  rawHtml: true,
});

// Base success response fields that are always present
const LinksSuccessResponseBaseSchema = LinksResponseBaseSchema.extend({
  /* Indicates that the operation was successful */
  success: z.literal(true).meta({
    description: 'Indicates that the operation was successful',
    examples: [true],
  }),
  /* Whether the result was returned from cache */
  cached: z.boolean().meta({
    description: 'Whether the result was returned from cache',
    examples: [false],
  }),
  /* Array of parent URLs leading to this URL */
  ancestors: z
    .array(z.string())
    .optional()
    .meta({
      description: 'Array of parent URLs leading to this URL',
      examples: ['https://example.com'],
    }),
  /* Metrics for the links extraction operation */
  metrics: MetricsSchema.optional().meta({
    title: 'Metrics',
    description: 'Metrics for the links extraction operation',
    examples: [
      {
        readableDuration: '0.2s',
        durationMs: 200,
        startTimeMs: 1704067800000,
        endTimeMs: 1704067800200,
      },
    ],
  }),
});

// Response when tree is included - content fields are in tree root, not response root
const LinksSuccessResponseWithTreeSchema =
  LinksSuccessResponseBaseSchema.extend({
    /* Site map tree starting from the root URL (required when tree generation is enabled) */
    tree: LinksTreeSchema.meta({
      title: 'LinksTree',
      description:
        'Site map tree starting from the root URL (required when tree generation is enabled)',
    }),
  });

// Response when tree is not included - content fields are in response root
const LinksSuccessResponseWithoutTreeSchema =
  LinksSuccessResponseBaseSchema.extend(PartialScrapedDataSchema.shape).extend({
    /* URLs that were skipped during processing with reasons */
    skippedUrls: SkippedLinksSchema.optional().meta({
      title: 'SkippedLinks',
      description: 'URLs that were skipped during processing with reasons',
    }),
    /* Links found on this page, categorized by type */
    extractedLinks: ExtractedLinksSchema.optional().meta({
      title: 'ExtractedLinks',
      description: 'Links found on this page, categorized by type',
    }),
  });

// Export individual schemas for direct use
export {
  LinksSuccessResponseWithTreeSchema,
  LinksSuccessResponseWithoutTreeSchema,
};

// Discriminated union schema
export const LinksSuccessResponseSchema = z
  .union([
    LinksSuccessResponseWithTreeSchema,
    LinksSuccessResponseWithoutTreeSchema,
  ])
  .meta({
    title: 'LinksSuccessResponse',
    description:
      'Successful response from the links extraction operation. Response structure varies based on whether tree generation is enabled.',
    examples: [
      // Example with tree (content in tree root)
      {
        success: true,
        cached: false,
        targetUrl: 'https://example.com',
        timestamp: '2024-01-15T10:30:00.000Z',
        ancestors: ['https://example.com'],
        tree: {
          url: 'https://example.com',
          rootUrl: 'https://example.com',
          name: 'Home',
          totalUrls: 25,
          lastUpdated: '2024-01-15T10:30:00.000Z',
          metadata: {
            title: 'Example Website',
            description: 'Welcome to our example website',
          },
          extractedLinks: {
            internal: [
              'https://example.com/about',
              'https://example.com/contact',
            ],
            external: ['https://external-site.com/reference'],
            media: {
              images: ['https://example.com/logo.png'],
              videos: [],
              documents: ['https://example.com/brochure.pdf'],
            },
          },
          skippedUrls: {
            internal: [
              {
                url: 'https://example.com/admin',
                reason: 'Blocked by robots.txt',
              },
            ],
          },
          children: [
            {
              url: 'https://example.com/about',
              name: 'About',
              lastUpdated: '2024-01-15T10:30:05.000Z',
            },
          ],
        },
      },
      // Example without tree (content in response root)
      {
        success: true,
        cached: false,
        targetUrl: 'https://example.com',
        timestamp: '2024-01-15T10:30:00.000Z',
        ancestors: ['https://example.com'],
        title: 'Example Website',
        description: 'Welcome to our example website',
        extractedLinks: {
          internal: [
            'https://example.com/about',
            'https://example.com/contact',
          ],
          external: ['https://external-site.com/reference'],
          media: {
            images: ['https://example.com/logo.png'],
            videos: [],
            documents: ['https://example.com/brochure.pdf'],
          },
        },
        skippedUrls: {
          internal: [
            {
              url: 'https://example.com/admin',
              reason: 'Blocked by robots.txt',
            },
          ],
        },
      },
    ],
  });

export const LinksErrorResponseSchema = BaseErrorResponseSchema.extend({
  /* LinksTree - Partial site map tree if available, or undefined if no tree could be generated */
  tree: LinksTreeSchema.optional().meta({
    title: 'LinksTree',
    description:
      'LinksTree - Partial site map tree if available, or undefined if no tree could be generated',
  }),
}).meta({
  title: 'LinksErrorResponse',
  description: 'Error response from the links extraction operation',
  examples: [
    {
      success: false,
      requestUrl: 'https://example.com/article#fragment',
      targetUrl: 'https://example.com',
      timestamp: '2024-01-15T10:30:00.000Z',
      error: 'Failed to fetch: 404 Not Found',
    },
  ],
});

// type PartialExceptUrl<T extends z.infer<typeof LinksOptionsSchema>> = {
//   url: T['url'];
// } & Partial<Omit<T, 'url'>>;

/**
 * Type representing options for link scraping operations.
 * Derived from the linksOptionsSchema.
 *
 * @see {@link LinksOptionsSchema}
 *
 * @property {string} url - The URL to extract links from
 * @property {boolean} [tree] - Whether to build a site map tree
 * @property {Object} [linkExtractionOptions] - Options for link extraction
 * @property {Object} [cacheOptions] - Cache configuration for links operation
 * @property {Object} [metricsOptions] - Options for metrics for links operation
 * @property {boolean} [folderFirst] - Whether to place folders before leaf nodes in the tree
 * @property {'page'|'alphabetical'} [linksOrder] - How to order links within each folder
 * @property {boolean} [extractedLinks] - Whether to include extracted links for each node in the tree
 * @property {boolean} [subdomainAsRootUrl] - Whether to treat subdomain as root URL
 * @property {boolean} [isPlatformUrl] - Whether the URL is a platform URL
 * @property {boolean} [metadata] - Whether to extract metadata from the page
 * @property {boolean} [cleanedHtml] - Whether to return cleaned HTML
 * @property {boolean} [robots] - Whether to fetch and parse robots.txt
 * @property {boolean} [sitemapXML] - Whether to fetch and parse sitemap.xml
 * @property {Object} [metadataOptions] - Options for metadata extraction
 * @property {'cheerio-reader'|'html-rewriter'} [cleaningProcessor] - The cleaning processor to use
 * @property {Object} [htmlRewriterOptions] - Options for HTML cleaning with html-rewriter
 * @property {Object} [readerCleaningOptions] - Options for HTML cleaning with cheerio-reader
 * @property {Object} [fetchOptions] - Options for the fetch request
 *
 * @example
 * ```typescript
 * const options = {
 *   url: "https://example.com",
 *   tree: true,
 *   metadata: true,
 *   cleanedHtml: false,
 *   subdomainAsRootUrl: true,
 *   isPlatformUrl: false,
 * };
 * ```
 */
export type LinksOptions = z.infer<typeof LinksOptionsSchema>;

/**
 * Represents a URL that was skipped during scraping.
 * Includes the reason why it was not processed.
 *
 * @property url - The URL that was skipped
 * @property reason - The reason why this URL was skipped
 *
 * @example
 * ```typescript
 * const skippedUrl: SkippedUrl = {
 *   url: "https://example.com/private",
 *   reason: "Blocked by robots.txt"
 * };
 * ```
 */
export type SkippedUrl = z.infer<typeof SkippedUrlSchema>;

/**
 * Categorized collection of skipped URLs.
 * Follows the same structure as ExtractedLinks for consistency.
 *
 * @property internal - Internal links that were skipped
 * @property external - External links that were skipped
 * @property media - Media links that were skipped
 * @property other - Other links that don't fit into the above categories
 *
 * @example
 * ```typescript
 * const skippedLinks: SkippedLinks = {
 *   internal: [
 *     { url: "https://example.com/private", reason: "Blocked by robots.txt" }
 *   ],
 *   external: [
 *     { url: "https://external.com", reason: "External domain" }
 *   ]
 * };
 * ```
 */
export type SkippedLinks = z.infer<typeof SkippedLinksSchema>;

/**
 * Represents a URL that has been visited.
 * Used to track when URLs were last accessed.
 *
 * @property url - The URL that was visited
 * @property lastVisited - ISO timestamp when this URL was last visited
 */
export type VisitedUrl = z.infer<typeof VisitedUrlSchema>;

/**
 * Successful links response when tree generation is enabled.
 * Content fields (title, description, metadata, etc.) are included in the tree root node, not at response root level.
 *
 * @example With tree (content in tree root):
 * ```typescript
 * const responseWithTree: LinksSuccessResponseWithTree = {
 *   success: true,
 *   cached: false,
 *   targetUrl: "https://example.com",
 *   timestamp: "2024-01-15T10:30:00.000Z",
 *   ancestors: ["https://example.com"],
 *   tree: {
 *     url: "https://example.com",
 *     name: "Home",
 *     lastUpdated: "2024-01-15T10:30:00.000Z",
 *     metadata: { title: "Example", description: "..." },
 *     extractedLinks: { internal: [...], external: [...] },
 *     children: [...]
 *   }
 * };
 *
 * if ('tree' in responseWithTree) {
 *   // TypeScript knows this has tree and no root-level content
 *   console.log(responseWithTree.tree.metadata?.title);
 * }
 * ```
 */
export type LinksSuccessResponseWithTree = z.infer<
  typeof LinksSuccessResponseWithTreeSchema
>;

/**
 * Successful links response when tree generation is disabled.
 * Content fields (title, description, metadata, etc.) are included at response root level.
 *
 * @example Without tree (content in response root):
 * ```typescript
 * const responseWithoutTree: LinksSuccessResponseWithoutTree = {
 *   success: true,
 *   cached: false,
 *   targetUrl: "https://example.com",
 *   timestamp: "2024-01-15T10:30:00.000Z",
 *   title: "Example Website",
 *   description: "Welcome to our site",
 *   metadata: { title: "Example", description: "..." },
 *   extractedLinks: { internal: [...], external: [...] }
 * };
 *
 * if (!('tree' in responseWithoutTree) || !responseWithoutTree.tree) {
 *   // TypeScript knows this has root-level content and no tree
 *   console.log(responseWithoutTree.title);
 * }
 * ```
 */
export type LinksSuccessResponseWithoutTree = z.infer<
  typeof LinksSuccessResponseWithoutTreeSchema
>;

/**
 * Discriminated union representing a successful links extraction response.
 * The structure varies based on whether tree generation is enabled.
 *
 * Use type guards to narrow the type:
 * - `'tree' in response && response.tree` - response with tree
 * - `!('tree' in response) || !response.tree` - response without tree
 *
 * @example Type narrowing:
 * ```typescript
 * function handleResponse(response: LinksSuccessResponse) {
 *   if ('tree' in response && response.tree) {
 *     // TypeScript infers LinksSuccessResponseWithTree
 *     console.log(response.tree.metadata?.title);
 *   } else {
 *     // TypeScript infers LinksSuccessResponseWithoutTree
 *     console.log(response.title);
 *   }
 * }
 * ```
 */
export type LinksSuccessResponse = z.infer<typeof LinksSuccessResponseSchema>;

/**
 * Represents an error response from a links POST route.
 * Contains information about what went wrong.
 *
 * @property success - Whether the operation was successful
 * @property [requestUrl] - URL, raw url, that was requested to be processed and might be different from the target url
 * @property targetUrl - The URL that was requested to be scraped
 * @property timestamp - ISO timestamp when the request was processed
 * @property error - Error message describing what went wrong
 * @property tree - Partial site map tree if available
 *
 * @example
 * ```typescript
 * const errorResponse: LinksErrorResponse = {
 *   success: false,
 *   requestUrl: "https://example.com/article#fragment",
 *   targetUrl: "https://example.com",
 *   timestamp: "2025-04-02T14:28:23.000Z",
 *   error: "Failed to connect to the server"
 * };
 * ```
 */
export type LinksErrorResponse = z.infer<typeof LinksErrorResponseSchema>;

/**
 * Union type representing either a successful or failed link scraping operation.
 * Uses a discriminated union pattern with the 'success' property as the discriminator.
 *
 * @example
 * ```typescript
 * function handleResponse(response: LinksResponse) {
 *   if (response.success) {
 *     // TypeScript knows this is a LinksSuccessResponse
 *     console.log(response.metadata?.title);
 *   } else {
 *     // TypeScript knows this is a LinksErrorResponse
 *     console.error(response.error);
 *   }
 * }
 * ```
 */
export type LinksResponse = LinksSuccessResponse | LinksErrorResponse;
