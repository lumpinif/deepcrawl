import { MetadataOptionsSchema } from '@deepcrawl/types/services/metadata';
import { ScrapedDataSchema } from '@deepcrawl/types/services/scrape';
import { z } from '@hono/zod-openapi';

export const ReadOptionsSchema = z
  .object({
    /**
     * The URL to scrape.
     * Must be a valid URL string.
     */
    url: z.string(),

    /**
     * Whether to extract metadata from the page.
     * Default: true
     */
    // default true if not set
    metadata: z.coerce.boolean().optional().default(true).openapi({
      default: true,
      description: 'Whether to extract metadata from the page.',
    }),

    /**
     * Whether to extract markdown from the page.
     * Default: true
     */
    // default true if not set
    markdown: z.coerce.boolean().optional().default(true).openapi({
      default: true,
      description: 'Whether to extract markdown from the page.',
    }),

    /**
     * Whether to return cleaned HTML.
     * Default: false
     */
    cleanedHtml: z.coerce.boolean().optional().default(false).openapi({
      default: false,
      description: 'Whether to return cleaned HTML.',
    }),

    /**
     * Whether to fetch and parse robots.txt.
     * Default: false
     */
    robots: z.coerce.boolean().optional().default(false).openapi({
      default: false,
      description: 'Whether to fetch and parse robots.txt.',
    }),

    /**
     * Whether to return raw HTML.
     * Default: false
     */
    rawHtml: z.coerce.boolean().optional().default(false).openapi({
      default: false,
      description: 'Whether to return raw HTML.',
    }),

    /**
     * Options for metadata extraction.
     * Controls how metadata like title, description, etc. are extracted.
     */
    metadataOptions: MetadataOptionsSchema.optional().openapi({
      description: 'Options for metadata extraction.',
    }),

    /** DEPRECATED: AS WE ARE NOT USING HTMLREWRITE FOR CLEANING THE HTML FOR NOW, MAY BE REUSED THIS IN THE FUTURE
     * Options for HTML cleaning.
     * Controls how HTML is sanitized and cleaned.
     */
    // cleanedHtmlOptions: HTMLCleaningOptionsSchema.optional(),
  })
  .openapi('ReadOptions');

export const ReadResponseBaseSchema = z.object({
  success: z.boolean(),
  cached: z.boolean().optional().default(false).openapi({
    default: false,
    description:
      'The flag to indicate whether the response was cached. This is always false since we are not caching the response for privacy reasons. You need to cache it yourself in your application.',
  }),
  targetUrl: z.string(),
});

export const ReadErrorResponseSchema = ReadResponseBaseSchema.omit({
  cached: true,
}).extend({
  success: z.literal(false),
  error: z.string(),
});

export const MetricsSchema = z
  .object({
    readableDuration: z.string(),
    duration: z.number(),
    startTime: z.number(),
    endTime: z.number(),
  })
  .openapi('Metrics');

export const ReadSuccessResponseSchema = ReadResponseBaseSchema.extend({
  success: z.literal(true), // override to enforce success: true
})
  .merge(ScrapedDataSchema.omit({ rawHtml: true }))
  .extend({
    markdown: z.string().optional().openapi({
      description: 'Markdown content of the page.',
    }),
    rawHtml: z.string().optional().openapi({
      description: 'Raw HTML content of the page.',
    }),
    metrics: MetricsSchema.optional().openapi({
      description: 'Metrics for the read operation.',
    }),
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
