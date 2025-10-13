import * as z from 'zod/v4';

/**
 * Common error response schema used across all endpoints.
 * Provides a standardized error response structure.
 *
 * @property {string} requestId - Unique identifier (request ID) for the activity log entry
 * @property {false} success - Always false for error responses
 * @property {string} targetUrl - URL that was being processed when error occurred
 * @property {string} [requestUrl] - URL, raw url, that was requested to be processed and might be different from the target url
 * @property {string} timestamp - ISO timestamp when the error occurred
 * @property {string} error - Error message describing what went wrong
 *
 * @example
 * ```typescript
 * const errorResponse = {
 *   requestId: '123e4567-e89b-12d3-a456-426614174000',
 *   success: false,
 *   requestUrl: 'https://example.com/article#fragment',
 *   targetUrl: 'https://example.com/article',
 *   timestamp: '2024-01-15T10:30:00.000Z'
 *   error: 'Failed to fetch: 404 Not Found',
 * };
 * ```
 */
export const BaseErrorResponseSchema = z
  .object({
    requestId: z.string().meta({
      description: 'Unique identifier (request ID) for the activity log entry',
      examples: ['123e4567-e89b-12d3-a456-426614174000'],
    }),
    /* Indicates that the operation failed */
    success: z.literal(false).meta({
      description: 'Indicates that the operation failed',
      examples: [false],
    }),
    /* The URL, raw url, that was requested to be processed and might be different from the target url */
    requestUrl: z
      .string()
      .optional()
      .meta({
        description:
          'The URL, raw url, that was requested to be processed and might be different from the target url',
        examples: ['https://example.com/article#fragment'],
      }),
    /* The URL that was being processed when the error occurred */
    targetUrl: z.string().meta({
      description: 'The URL that was being processed when the error occurred',
      examples: ['https://example.com/article'],
    }),
    /* ISO timestamp when the error occurred */
    timestamp: z.string().meta({
      description: 'ISO timestamp when the error occurred',
      examples: ['2024-01-15T10:30:00.000Z'],
    }),
    /* Error message describing what went wrong */
    error: z.string().meta({
      description: 'Error message describing what went wrong',
      examples: ['Failed to fetch: 404 Not Found'],
    }),
  })
  .meta({
    title: 'BaseErrorResponse',
    description: 'Common error response schema used across all endpoints',
    examples: [
      {
        success: false,
        targetUrl: 'https://example.com/article',
        requestUrl: 'https://example.com/article#fragment', // optional
        timestamp: '2024-01-15T10:30:00.000Z',
        error: 'Failed to fetch: 404 Not Found',
      },
    ],
  });

/**
 * Type alias for {@link BaseErrorResponseSchema}.
 * Provides the standardized error response structure shared across endpoints.
 */
export type BaseErrorResponse = z.infer<typeof BaseErrorResponseSchema>;

/**
 * Common base response schema for successful operations.
 * Contains standard fields that appear in most success responses.
 *
 * @property {true} success - Always true for successful responses
 * @property {string} targetUrl - URL that was processed
 * @property {string} timestamp - ISO timestamp when operation was completed
 * @property {boolean} cached - Whether response was served from cache
 *
 * @example
 * ```typescript
 * const successResponse = {
 *   success: true,
 *   cached: false,
 *   targetUrl: 'https://example.com',
 *   timestamp: '2024-01-15T10:30:00.000Z'
 * };
 * ```
 */
export const BaseSuccessResponseSchema = z
  .object({
    success: z.literal(true).meta({
      description: 'Indicates that the operation succeeded',
      examples: [true],
    }),
    cached: z.boolean().meta({
      description: 'Whether the response was served from cache',
      examples: [false],
    }),
    targetUrl: z.string().meta({
      description: 'The URL that was processed',
      examples: ['https://example.com/article'],
    }),
    timestamp: z.string().meta({
      description: 'ISO timestamp when the operation was completed',
      examples: ['2024-01-15T10:30:00.000Z'],
    }),
  })
  .meta({
    title: 'BaseSuccessResponse',
    description: 'Common base response schema for successful operations',
    examples: [
      {
        success: true,
        cached: false,
        targetUrl: 'https://example.com/article',
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    ],
  });

/**
 * Type alias for {@link BaseSuccessResponseSchema}.
 * Represents the shared fields included in successful responses.
 */
export type BaseSuccessResponse = z.infer<typeof BaseSuccessResponseSchema>;
