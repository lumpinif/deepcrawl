import { BaseErrorResponseSchema } from '@deepcrawl/types/common/response-schemas';
import { MetadataOptionsSchema } from '@deepcrawl/types/services/metadata';
import { ScrapedDataSchema } from '@deepcrawl/types/services/scrape';
import { z } from 'zod/v4';

/* NOTE: IN ZOD V4: The input type of all z.coerce schemas is now unknown. THIS MIGHT BREAKES CURRENT TYPES */

export const ReadOptionsSchema = z
  .object({
    /**
     * The URL to scrape.
     * Must be a valid URL string.
     */
    url: z.string().meta({
      description: 'The URL to read and extract content from',
      examples: ['https://example.com', 'example.com'],
    }),

    /**
     * Whether to extract metadata from the page.
     * Default: true
     */
    // default true if not set
    metadata: z.coerce
      .boolean()
      .optional()
      .default(true)
      .meta({
        description: 'Whether to extract metadata from the page.',
        examples: [true],
      }),

    /**
     * Whether to extract markdown from the page.
     * Default: true
     */
    // default true if not set
    markdown: z.coerce
      .boolean()
      .optional()
      .default(true)
      .meta({
        description: 'Whether to extract markdown from the page.',
        examples: [true],
      }),

    /**
     * Whether to return cleaned HTML.
     * Default: false
     */
    cleanedHtml: z.coerce
      .boolean()
      .optional()
      .default(false)
      .meta({
        description: 'Whether to return cleaned HTML.',
        examples: [false],
      }),

    /**
     * Whether to fetch and parse robots.txt.
     * Default: false
     */
    robots: z.coerce
      .boolean()
      .optional()
      .default(false)
      .meta({
        description: 'Whether to fetch and parse robots.txt.',
        examples: [false],
      }),

    /**
     * Whether to return raw HTML.
     * Default: false
     */
    rawHtml: z.coerce
      .boolean()
      .optional()
      .default(false)
      .meta({
        description: 'Whether to return raw HTML.',
        examples: [false],
      }),

    /**
     * Options for metadata extraction.
     * Controls how metadata like title, description, etc. are extracted.
     */
    metadataOptions: MetadataOptionsSchema.optional().meta({
      description: 'Options for metadata extraction.',
    }),

    /** DEPRECATED: AS WE ARE NOT USING HTMLREWRITE FOR CLEANING THE HTML FOR NOW, MAY BE REUSED THIS IN THE FUTURE
     * Options for HTML cleaning.
     * Controls how HTML is sanitized and cleaned.
     */
    // cleanedHtmlOptions: HTMLCleaningOptionsSchema.optional(),
  })
  .meta({
    title: 'ReadOptions',
    description: 'Configuration options for read operation',
    examples: [
      {
        url: 'https://example.com',
        metadata: true,
        markdown: true,
        cleanedHtml: false,
        robots: false,
        rawHtml: false,
        metadataOptions: {
          title: true,
          description: true,
          language: true,
          canonical: true,
          robots: true,
        },
      },
    ],
  });

export const ReadResponseBaseSchema = z.object({
  success: z.boolean().meta({
    description: 'Indicates whether the operation was successful',
  }),
  cached: z
    .boolean()
    .optional()
    .default(false)
    .meta({
      description:
        'The flag to indicate whether the response was cached. This is always false since we are not caching the response for privacy reasons. You need to cache it yourself in your application.',
      examples: [false],
    }),
  targetUrl: z.string().meta({
    description: 'The URL that was requested to be processed',
    examples: ['https://example.com'],
  }),
});

export const ReadErrorResponseSchema = BaseErrorResponseSchema;

export const MetricsSchema = z
  .object({
    readableDuration: z.string().meta({
      description: 'Human-readable representation of the operation duration',
      examples: ['0.2s'],
    }),
    duration: z.number().meta({
      description: 'Duration of the operation in milliseconds',
      examples: [200],
    }),
    startTime: z.number().meta({
      description: 'Timestamp in milliseconds when the operation started',
      examples: [1704067800000],
    }),
    endTime: z.number().meta({
      description: 'Timestamp in milliseconds when the operation finished',
      examples: [1704067800200],
    }),
  })
  .meta({
    title: 'Metrics',
    description: 'Performance metrics for the read operation',
    examples: [
      {
        readableDuration: '0.2s',
        duration: 200,
        startTime: 1704067800000,
        endTime: 1704067800200,
      },
    ],
  });

export const ReadSuccessResponseSchema = z
  .object({
    ...ReadResponseBaseSchema.shape,
    success: z.literal(true).meta({
      description: 'Indicates that the operation was successful',
      examples: [true],
    }), // override to enforce success: true
    ...ScrapedDataSchema.omit({ rawHtml: true }).shape,
    markdown: z
      .string()
      .optional()
      .meta({
        description: 'Markdown content of the page.',
        examples: [
          '# Example Article\n\nThis is the main content of the article.',
        ],
      }),
    rawHtml: z
      .string()
      .optional()
      .meta({
        description: 'Raw HTML content of the page.',
        examples: [
          '<html><head><title>Example</title></head><body><h1>Example Article</h1></body></html>',
        ],
      }),
    metrics: MetricsSchema.optional().meta({
      description: 'Metrics for the read operation.',
      examples: [
        {
          readableDuration: '0.2s',
          duration: 200,
          startTime: 1704067800000,
          endTime: 1704067800200,
        },
      ],
    }),
  })
  .meta({
    title: 'ReadSuccessResponse',
    description: 'Successful response from the read operation',
    examples: [
      {
        success: true,
        cached: false,
        targetUrl: 'https://example.com/article',
        title: 'Example Article',
        description: 'This is an example article description',
        markdown:
          '# Example Article\n\nThis is the main content of the article.\n\n## Introduction\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.',
        metadata: {
          title: 'Example Article',
          description: 'This is an example article description',
          language: 'en',
          canonical: 'https://example.com/article',
          robots: 'index, follow',
          author: 'John Doe',
          keywords: ['example', 'article', 'demo'],
          favicon: 'https://example.com/favicon.ico',
          ogTitle: 'Example Article',
          ogDescription: 'This is an example article description',
          ogImage: 'https://example.com/og-image.jpg',
          ogUrl: 'https://example.com/article',
          ogType: 'article',
          ogSiteName: 'Example Site',
          twitterCard: 'summary_large_image',
          twitterTitle: 'Example Article',
          twitterDescription: 'This is an example article description',
          twitterImage: 'https://example.com/twitter-image.jpg',
          isIframeAllowed: true,
        },
        metrics: {
          readableDuration: '0.2s',
          duration: 200,
          startTime: 1704067800000,
          endTime: 1704067800200,
        },
      },
    ],
  });

type PartialExceptUrl<T extends z.infer<typeof ReadOptionsSchema>> = {
  url: T['url'];
} & Partial<Omit<T, 'url'>>;

/**
 * Type representing options for read operations.
 * Derived from the readOptionsSchema.
 */
export type ReadOptions = PartialExceptUrl<z.infer<typeof ReadOptionsSchema>>;

/**
 * Base type for read responses.
 * Contains common properties for both success and error responses.
 */
export type ReadResponseBase = z.infer<typeof ReadResponseBaseSchema>;

/**
 * Type representing an error response.
 */
export type ReadErrorResponse = z.infer<typeof ReadErrorResponseSchema>;

/**
 * Type representing a success response.
 */
export type ReadSuccessResponse = z.infer<typeof ReadSuccessResponseSchema>;

/**
 * Type representing a string response.
 */
export type ReadStringResponse = string;

/**
 * Type representing a POST response.
 */
export type ReadPostResponse = ReadSuccessResponse | ReadErrorResponse;

/**
 * Type representing a response.
 */
export type ReadResponse = ReadStringResponse | ReadPostResponse;
