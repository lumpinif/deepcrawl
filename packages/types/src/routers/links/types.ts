import { BaseErrorResponseSchema } from '@deepcrawl/types/common/response-schemas';
import { smartboolTrue } from '@deepcrawl/types/common/smart-schemas';

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

/**
 * Schema for links order enum.
 * Defines how links should be ordered within folders.
 */
export const LinksOrderSchema = z.enum(['page', 'alphabetical']).meta({
  title: 'LinksOrder',
  description:
    'How to order links within each folder: "page" (preserve original order) or "alphabetical" (sort A→Z by URL).',
  examples: ['alphabetical'],
});

/**
 * Schema for tree options.
 * Defines options for building a site map tree.
 *
 * @property folderFirst - Whether to place folders before leaf nodes in the tree
 * @property linksOrder - How to order links within each folder
 */
export const TreeOptionsSchema = z
  .object({
    /**
     * Whether to place folders before leaf nodes in the tree.
     * Default: true
     */
    folderFirst: smartboolTrue().meta({
      description: 'Whether to place folders before leaf nodes in the tree.',
      examples: [true],
    }),
    /**
     * How to order links within each folder:
     *  - 'page'        preserve the original document order
     *  - 'alphabetical'  sort A→Z by URL
     * Default: 'page'
     */
    linksOrder: LinksOrderSchema.optional(),

    /**
     * Whether to include extracted links for each node in the tree.
     * Default: true
     */
    extractedLinks: smartboolTrue().meta({
      description:
        'Whether to include extracted links for each node in the tree.',
      examples: [true],
    }),

    /**
     * Whether to exclude subdomain as root URL.
     * Default: true
     * e.g., if false: rootUrl: https://swr.vercel.app -> https://vercel.app
     */
    subdomainAsRootUrl: smartboolTrue().meta({
      description:
        'Whether to treat subdomain as root URL. If false, subdomain will be excluded from root URL. e.g., if false: rootUrl: `https://swr.vercel.app` -> `https://vercel.app`',
      examples: [false],
    }),
  })
  .meta({
    title: 'TreeOptions',
    description: 'Options for building a site map tree',
  });

/**
 * Schema for links route options.
 * Defines the configuration for a links operation.
 *
 * @property url - The URL to scrape
 * @property tree - Whether to build a site map tree
 * @property metadata - Whether to extract metadata from the page
 * @property cleanedHtml - Whether to return cleaned HTML
 * @property robots - Whether to fetch and parse robots.txt
 * @property sitemapXML - Whether to fetch and parse sitemap.xml
 * @property linksFromTarget - Whether to extract links from the target page
 * @property metadataOptions - Options for metadata extraction
 * @property linkExtractionOptions - Options for link extraction
 * @property htmlRewriterOptions - Options for HTML cleaning
 * @property subdomainAsRootUrl - Whether to exclude subdomain as root URL
 *
 * @example
 * ```typescript
 * const options = {
 *   url: "https://example.com",
 *   tree: true,
 *   metadata: true,
 *   cleanedHtml: false,
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
    tree: smartboolTrue().meta({
      description: 'Whether to build a site map tree.',
      examples: [true],
    }),

    /**
     * Options for link extraction.
     * Controls how links are extracted and categorized.
     */
    linkExtractionOptions: LinkExtractionOptionsSchema.optional(),
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

// Define the type first to avoid circular reference
// export type LinksTree = {
//   url: string;
//   rootUrl?: string;
//   name?: string;
//   totalUrls?: number;
//   executionTime?: string;
//   lastUpdated: string;
//   lastVisited?: string | null;
//   error?: string;
//   metadata?: z.infer<typeof PageMetadataSchema>;
//   cleanedHtml?: string;
//   extractedLinks?: z.infer<typeof ExtractedLinksSchema>;
//   skippedUrls?: z.infer<typeof SkippedLinksSchema>;
//   children?: LinksTree[];
// };

export type LinksTree = z.infer<typeof LinksTreeSchema>;

export const LinksTreeSchema = z
  .object({
    // Inline all properties for better OpenAPI documentation display
    url: z.string().meta({
      description: 'The URL of this page',
      examples: ['https://example.com/about'],
    }),
    rootUrl: z
      .string()
      .optional()
      .meta({
        description: 'The root URL of the website being crawled',
        examples: ['https://example.com'],
      }),
    name: z
      .string()
      .optional()
      .meta({
        description: 'The display name or title of this page',
        examples: ['About Us'],
      }),
    totalUrls: z
      .number()
      .optional()
      .meta({
        description: 'Total number of URLs discovered in the entire tree',
        examples: [150],
      }),
    executionTime: z
      .string()
      .optional()
      .meta({
        description: 'Time taken to process this page',
        examples: ['0.2s'],
      }),
    lastUpdated: z.string().meta({
      description: 'ISO timestamp when this page was last crawled',
      examples: ['2024-01-15T10:30:00.000Z'],
    }),
    lastVisited: z
      .string()
      .nullable()
      .optional()
      .meta({
        description:
          'ISO timestamp when this page was last visited (null if never visited)',
        examples: ['2024-01-15T10:30:00.000Z'],
      }),
    error: z
      .string()
      .optional()
      .meta({
        description: 'Error message if there was an issue processing this page',
        examples: ['Failed to fetch: 404 Not Found'],
      }),
    metadata: PageMetadataSchema.optional().meta({
      title: 'PageMetadata',
      description:
        'Extracted metadata from the page (title, description, etc.)',
    }),
    cleanedHtml: z.string().optional().meta({
      description: 'Cleaned HTML content of the page',
    }),
    extractedLinks: ExtractedLinksSchema.optional().meta({
      title: 'ExtractedLinks',
      description: 'Links found on this page, categorized by type',
    }),
    skippedUrls: SkippedLinksSchema.optional().meta({
      title: 'SkippedLinks',
      description: 'URLs that were skipped during processing with reasons',
    }),
    // Add the recursive children property using getter
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
        executionTime: '1.2s',
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
  success: z.boolean().meta({
    description: 'Indicates whether the operation was successful',
  }),
  targetUrl: z.string().meta({
    description: 'The URL that was requested to be processed',
    examples: ['https://example.com'],
  }),
  timestamp: z.string().meta({
    description: 'ISO timestamp when the request was processed',
    examples: ['2024-01-15T10:30:00.000Z'],
  }),
});

/* NOTE: use partial() to make all properties optional for /links response for better response shape such as not returning title and description if there is tree */
const PartialScrapedDataSchema = ScrapedDataSchema.partial().omit({
  rawHtml: true,
});

export const LinksSuccessResponseSchema = LinksResponseBaseSchema.extend(
  PartialScrapedDataSchema.shape,
)
  .extend({
    success: z.literal(true).meta({
      description: 'Indicates that the operation was successful',
      examples: [true],
    }),
    cached: z.boolean().meta({
      description: 'Whether the result was returned from cache',
      examples: [false],
    }),
    executionTime: z
      .string()
      .optional()
      .meta({
        description: 'Time taken to execute the request',
        examples: ['0.2s'],
      }),
    ancestors: z
      .array(z.string())
      .optional()
      .meta({
        description: 'Array of parent URLs leading to this URL',
        examples: ['https://example.com'],
      }),
    skippedUrls: SkippedLinksSchema.optional().meta({
      title: 'SkippedLinks',
      description: 'URLs that were skipped during processing with reasons',
    }),
    extractedLinks: ExtractedLinksSchema.optional().meta({
      title: 'ExtractedLinks',
      description: 'Links found on this page, categorized by type',
    }),
    tree: LinksTreeSchema.optional().meta({
      title: 'LinksTree',
      description:
        'LinksTree - Site map tree starting from the root URL, or undefined if tree generation was disabled',
    }),
  })
  .meta({
    title: 'LinksSuccessResponse',
    description: 'Successful response from the links extraction operation',
    examples: [
      {
        success: true,
        targetUrl: 'https://example.com',
        timestamp: '2024-01-15T10:30:00.000Z',
        cached: false,
        executionTime: '0.2s',
        title: 'Example Website',
        description: 'Welcome to our example website',
        ancestors: ['https://example.com'],
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
        tree: {
          url: 'https://example.com',
          rootUrl: 'https://example.com',
          name: 'Home',
          totalUrls: 25,
          executionTime: '0.2s',
          lastUpdated: '2024-01-15T10:30:00.000Z',
          children: [
            {
              url: 'https://example.com/about',
              name: 'About',
              lastUpdated: '2024-01-15T10:30:05.000Z',
            },
          ],
        },
      },
    ],
  });

export const LinksErrorResponseSchema = BaseErrorResponseSchema.extend({
  timestamp: z.string().meta({
    description: 'ISO timestamp when the error occurred',
    examples: ['2024-01-15T10:30:00.000Z'],
  }),
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
      targetUrl: 'https://example.com',
      timestamp: '2024-01-15T10:30:00.000Z',
      error: 'Failed to fetch: 404 Not Found',
    },
  ],
});

/**
 * @name    can be imported as LinksTree or Tree
 * @description Represents a node in the site map tree.
 * Each node contains information about a URL and its child pages.
 *
 * @property url - The URL of this node
 * @property rootUrl - The root URL of the website
 * @property name - The name of this node
 * @property totalUrls - Total number of URLs in the tree
 * @property executionTime - Execution time of the request in milliseconds
 * @property lastUpdated - ISO timestamp when this node was last updated
 * @property lastVisited - ISO timestamp when this URL was last visited
 * @property children - Child pages of this URL
 * @property error - Error message if there was an issue processing this URL
 * @property metadata - Metadata extracted from the page
 * @property cleanedHtml - Cleaned HTML content of the page
 * @property extractedLinks - Extracted links from the page
 * @property skippedUrls - URLs that were skipped during processing
 *
 * @example
 * ```typescript
 * const treeNode: LinksTree = {
 *   url: "https://example.com",
 *   rootUrl: "https://example.com",
 *   name: "example",
 *   totalUrls: 10,
 *   executionTime: "1234ms",
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
 *     },
 *     skippedUrls: {
 *       internal: [
 *         { url: "https://example.com/private", reason: "Blocked by robots.txt" }
 *       ],
 *       external: [
 *         { url: "https://othersite.com", reason: "External domain" }
 *       ]
 *     }
 *   }
 * };
 * ```
 */

type PartialExceptUrl<T extends z.infer<typeof LinksOptionsSchema>> = {
  url: T['url'];
} & Partial<Omit<T, 'url'>>;

/**
 * Type representing options for link scraping operations.
 * Derived from the linksOptionsSchema.
 */
export type LinksOptions = PartialExceptUrl<z.infer<typeof LinksOptionsSchema>>;

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
 * Represents a successful links POST route response.
 * Contains the scraped data and related information.
 *
 * @property success - Whether the operation was successful
 * @property cached - Whether the result is returned from cache
 * @property targetUrl - The URL that was requested to be scraped
 * @property timestamp - ISO timestamp when the request was processed
 * @property executionTime - Execution time of the request in milliseconds
 * @property ancestors - Array of parent URLs leading to this URL
 * @property skippedUrls - URLs that were skipped during processing
 * @property tree - Site map tree starting from the root URL
 *
 * @example
 * ```typescript
 * const successResponse: LinksSuccessResponse = {
 *   success: true,
 *   targetUrl: "https://example.com",
 *   timestamp: "2025-04-02T14:28:23.000Z",
 *   executionTime: "1234ms",
 *   ancestors: ["https://example.com", "https://example.com/about"],
 *   skippedUrls: {
 *     internal: ["https://example.com/private"],
 *     external: ["https://othersite.com/reference"],
 *     media: {
 *       images: ["https://example.com/images/logo.png"],
 *       videos: ["https://example.com/videos/intro.mp4"],
 *       documents: ["https://example.com/docs/whitepaper.pdf"]
 *     }
 *   },
 *   tree: {
 *     data: {
 *       url: "https://example.com",
 *       lastUpdated: "2025-04-02T14:28:23.000Z",
 *       children: [...]
 *     }
 *   }
 * };
 * ```
 */
export type LinksSuccessResponse = z.infer<typeof LinksSuccessResponseSchema>;

/**
 * Represents an error response from a links POST route.
 * Contains information about what went wrong.
 *
 * @property success - Whether the operation was successful
 * @property targetUrl - The URL that was requested to be scraped
 * @property timestamp - ISO timestamp when the request was processed
 * @property error - Error message describing what went wrong
 * @property tree - Partial site map tree if available
 *
 * @example
 * ```typescript
 * const errorResponse: LinksErrorResponse = {
 *   success: false,
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
