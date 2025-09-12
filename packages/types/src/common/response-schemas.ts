import * as z from 'zod/v4';

/**
 * Common error response schema used across all endpoints.
 * Provides a standardized error response structure.
 *
 * @property {false} success - Always false for error responses
 * @property {string} targetUrl - URL that was being processed when error occurred
 * @property {string} error - Error message describing what went wrong
 *
 * @example
 * ```typescript
 * const errorResponse = {
 *   success: false,
 *   targetUrl: 'https://example.com',
 *   error: 'Failed to fetch: 404 Not Found'
 * };
 * ```
 */
export const BaseErrorResponseSchema = z
  .object({
    /* Indicates that the operation failed */
    success: z.literal(false).meta({
      description: 'Indicates that the operation failed',
      examples: [false],
    }),
    /* The URL that was being processed when the error occurred */
    targetUrl: z.string().meta({
      description: 'The URL that was being processed when the error occurred',
      examples: ['https://example.com/article'],
    }),
    /* Error message describing what went wrong */
    error: z.string().meta({
      description: 'Error message describing what went wrong',
      examples: ['Failed to fetch: 404 Not Found'],
    }),
    /* ISO timestamp when the error occurred */
    timestamp: z.string().meta({
      description: 'ISO timestamp when the error occurred',
      examples: ['2024-01-15T10:30:00.000Z'],
    }),
  })
  .meta({
    title: 'BaseErrorResponse',
    description: 'Common error response schema used across all endpoints',
    examples: [
      {
        success: false,
        targetUrl: 'https://example.com/article',
        error: 'Failed to fetch: 404 Not Found',
      },
    ],
  });

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
 *   targetUrl: 'https://example.com',
 *   timestamp: '2024-01-15T10:30:00.000Z',
 *   cached: false
 * };
 * ```
 */
export const BaseSuccessResponseSchema = z
  .object({
    success: z.literal(true).meta({
      description: 'Indicates that the operation succeeded',
      examples: [true],
    }),
    targetUrl: z.string().meta({
      description: 'The URL that was processed',
      examples: ['https://example.com/article'],
    }),
    timestamp: z.string().meta({
      description: 'ISO timestamp when the operation was completed',
      examples: ['2024-01-15T10:30:00.000Z'],
    }),
    cached: z.boolean().meta({
      description: 'Whether the response was served from cache',
      examples: [false],
    }),
  })
  .meta({
    title: 'BaseSuccessResponse',
    description: 'Common base response schema for successful operations',
    examples: [
      {
        success: true,
        targetUrl: 'https://example.com/article',
        timestamp: '2024-01-15T10:30:00.000Z',
        cached: false,
      },
    ],
  });
