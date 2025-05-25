import { MetadataOptionsSchema } from '@deepcrawl/types/services/metadata';
import { ScrapedDataSchema } from '@deepcrawl/types/services/scrape';
import { z } from '@hono/zod-openapi';

export const ReadOptionsSchema = z.object({
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
  metadata: z
    .preprocess(
      (val) => val !== 'false' && val !== false,
      z.boolean().optional(),
    )
    .openapi({
      default: true,
    }),

  /**
   * Whether to extract markdown from the page.
   * Default: true
   */
  // default true if not set
  markdown: z
    .preprocess(
      (val) => val !== 'false' && val !== false,
      z.boolean().optional(),
    )
    .openapi({
      default: true,
    }),

  /**
   * Whether to return cleaned HTML.
   * Default: true
   */
  cleanedHtml: z
    .preprocess(
      (val) => val !== 'false' && val !== false,
      z.boolean().optional(),
    )
    .openapi({
      default: true,
    }),

  /**
   * Whether to fetch and parse robots.txt.
   * Default: false
   */
  robots: z
    .preprocess((val) => val === 'true' || val === true, z.boolean().optional())
    .openapi({
      default: false,
    }),

  /**
   * Whether to return raw HTML.
   * Default: false
   */
  rawHtml: z
    .preprocess(
      (val) => val !== 'false' && val !== false,
      z.boolean().optional(),
    )
    .openapi({
      default: false,
    }),

  /**
   * Options for metadata extraction.
   * Controls how metadata like title, description, etc. are extracted.
   */
  metadataOptions: MetadataOptionsSchema.optional(),

  /** DEPRECATED: AS WE ARE NOT USING HTMLREWRITE FOR CLEANING THE HTML FOR NOW, MAY BE REUSED THIS IN THE FUTURE
   * Options for HTML cleaning.
   * Controls how HTML is sanitized and cleaned.
   */
  // cleanedHtmlOptions: HTMLCleaningOptionsSchema.optional(),
});

export const ReadResponseBaseSchema = z.object({
  success: z.boolean(),
  targetUrl: z.string(),
});

export const ReadErrorResponseSchema = ReadResponseBaseSchema.extend({
  success: z.literal(false),
  error: z.string(),
});

export const ReadSuccessResponseSchema = ReadResponseBaseSchema.extend({
  success: z.literal(true), // override to enforce success: true
})
  .merge(ScrapedDataSchema.omit({ rawHtml: true }))
  .extend({
    cached: z.boolean(),
    markdown: z.string().optional(),
    rawHtml: z.string().optional(),
    metrics: z
      .object({
        readableDuration: z.string(),
        duration: z.number(),
        startTime: z.number(),
        endTime: z.number(),
      })
      .optional(),
  });

/**
 * Type representing options for read operations.
 * Derived from the readOptionsSchema.
 */
export type ReadOptions = z.infer<typeof ReadOptionsSchema>;

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
