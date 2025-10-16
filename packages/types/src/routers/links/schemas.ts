import { z } from 'zod/v4';
import { BaseErrorResponseSchema } from '../../common/response-schemas';
import { OptionalBoolWithDefault } from '../../common/utils';
import {
  DEFAULT_CACHE_OPTIONS,
  DEFAULT_LINK_EXTRACTION_OPTIONS,
  DEFAULT_LINKS_OPTIONS,
  DEFAULT_TREE_OPTIONS,
} from '../../configs';
import { MetricsOptionsSchema, MetricsSchema } from '../../metrics/schemas';
import { CacheOptionsSchema } from '../../services/cache/schemas';
import {
  ExtractedLinksSchema,
  LinkExtractionOptionsSchema,
} from '../../services/link/schemas';
import { PageMetadataSchema } from '../../services/metadata/schemas';
import {
  ScrapedDataSchema,
  ScrapeOptionsSchema,
} from '../../services/scrape/schemas';

const {
  folderFirst,
  linksOrder,
  extractedLinks,
  subdomainAsRootUrl,
  isPlatformUrl,
} = DEFAULT_TREE_OPTIONS;

const { tree, metricsOptions } = DEFAULT_LINKS_OPTIONS;

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
    folderFirst: OptionalBoolWithDefault(folderFirst).meta({
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
    extractedLinks: OptionalBoolWithDefault(extractedLinks).meta({
      description: `Whether to include extracted links for each node in the tree. Default: ${extractedLinks}`,
      default: extractedLinks,
      examples: [extractedLinks, !extractedLinks],
    }),

    /**
     * Whether to exclude subdomain as root URL.
     * Default: true
     * e.g., if false: rootUrl: https://swr.vercel.app -> https://vercel.app
     */
    subdomainAsRootUrl: OptionalBoolWithDefault(subdomainAsRootUrl).meta({
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
    isPlatformUrl: OptionalBoolWithDefault(isPlatformUrl).meta({
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
    tree: OptionalBoolWithDefault(tree).meta({
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
     * An object containing the `expirationTtl` (optional) attribute
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

/**
 * Full configuration schema for the 'getLinks' RPC operation.
 * Alias of {@link LinksOptionsSchema} to provide endpoint-specific naming.
 */
export const GetLinksOptionsSchema = LinksOptionsSchema;

/**
 * Full configuration schema for the 'extractLinks' RPC operation.
 * Alias of {@link LinksOptionsSchema} to provide endpoint-specific naming.
 */
export const ExtractLinksOptionsSchema = LinksOptionsSchema;

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
  /* Unique identifier (request ID) for the activity log entry */
  requestId: z.string().meta({
    description: 'Unique identifier (request ID) for the activity log entry',
    examples: ['123e4567-e89b-12d3-a456-426614174000'],
  }),
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
export const LinksSuccessResponseWithTreeSchema =
  LinksSuccessResponseBaseSchema.extend({
    /* Site map tree starting from the root URL (required when tree generation is enabled) */
    tree: LinksTreeSchema.meta({
      title: 'LinksTree',
      description:
        'Site map tree starting from the root URL (required when tree generation is enabled)',
    }),
  });

// Response when tree is not included - content fields are in response root
export const LinksSuccessResponseWithoutTreeSchema =
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
        requestId: '123e4567-e89b-12d3-a456-426614174000',
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
        requestId: '123e4567-e89b-12d3-a456-426614174000',
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

/**
 * Alias for {@link LinksSuccessResponseSchema} that matches the `GetLinksResponse`
 * union exported from `deepcrawl/types`.
 */
export const GetLinksResponseSchema = LinksSuccessResponseSchema;

/**
 * Alias for {@link LinksSuccessResponseSchema} that matches the `ExtractLinksResponse`
 * union exported from `deepcrawl/types`.
 */
export const ExtractLinksResponseSchema = LinksSuccessResponseSchema;

/**
 * Alias for {@link LinksSuccessResponseWithTreeSchema} that matches the `GetLinksResponseWithTree`
 * union exported from `deepcrawl/types`.
 */
export const GetLinksResponseWithTreeSchema =
  LinksSuccessResponseWithTreeSchema;

/**
 * Alias for {@link LinksSuccessResponseWithTreeSchema} that matches the `ExtractLinksResponseWithTree`
 * union exported from `deepcrawl/types`.
 */
export const ExtractLinksResponseWithTreeSchema =
  LinksSuccessResponseWithTreeSchema;

/**
 * Alias for {@link LinksSuccessResponseWithoutTreeSchema} that matches the `GetLinksResponseWithoutTree`
 * union exported from `deepcrawl/types`.
 */
export const GetLinksResponseWithoutTreeSchema =
  LinksSuccessResponseWithoutTreeSchema;

/**
 * Alias for {@link LinksSuccessResponseWithoutTreeSchema} that matches the `ExtractLinksResponseWithoutTree`
 * union exported from `deepcrawl/types`.
 */
export const ExtractLinksResponseWithoutTreeSchema =
  LinksSuccessResponseWithoutTreeSchema;

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
      requestId: '123e4567-e89b-12d3-a456-426614174000',
      success: false,
      requestUrl: 'https://example.com/article#fragment',
      targetUrl: 'https://example.com',
      timestamp: '2024-01-15T10:30:00.000Z',
      error: 'Failed to fetch: 404 Not Found',
    },
  ],
});
