import * as z from 'zod/v4';

/**
 * Common error response schema used across all endpoints.
 * Provides a standardized error response structure.
 */
export const BaseErrorResponseSchema = z
  .object({
    success: z.literal(false).meta({
      description: 'Indicates that the operation failed',
      examples: [false],
    }),
    targetUrl: z.string().meta({
      description: 'The URL that was being processed when the error occurred',
      examples: ['https://example.com/article'],
    }),
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
        error: 'Failed to fetch: 404 Not Found',
      },
    ],
  });

/**
 * Common base response schema for successful operations.
 * Contains standard fields that appear in most success responses.
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
