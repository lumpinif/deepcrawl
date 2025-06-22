import { z } from '@hono/zod-openapi';

/**
 * Common error response schema used across all endpoints.
 * Provides a standardized error response structure.
 */
export const BaseErrorResponseSchema = z
  .object({
    success: z.literal(false).openapi({ type: 'boolean', example: false }),
    targetUrl: z.string().openapi({
      description: 'The URL that was being processed when the error occurred',
      example: 'https://example.com/article',
    }),
    error: z.string().openapi({
      description: 'Error message describing what went wrong',
      example: 'Failed to fetch: 404 Not Found',
    }),
  })
  .openapi('BaseErrorResponse', {
    example: {
      success: false,
      targetUrl: 'https://example.com/article',
      error: 'Failed to fetch: 404 Not Found',
    },
  });

/**
 * Common base response schema for successful operations.
 * Contains standard fields that appear in most success responses.
 */
export const BaseSuccessResponseSchema = z
  .object({
    success: z.literal(true).openapi({ type: 'boolean', example: true }),
    targetUrl: z.string().openapi({
      description: 'The URL that was processed',
      example: 'https://example.com/article',
    }),
    timestamp: z.string().openapi({
      description: 'ISO timestamp when the operation was completed',
      example: '2024-01-15T10:30:00.000Z',
    }),
    cached: z.boolean().openapi({
      description: 'Whether the response was served from cache',
      example: false,
    }),
  })
  .openapi('BaseSuccessResponse', {
    example: {
      success: true,
      targetUrl: 'https://example.com/article',
      timestamp: '2024-01-15T10:30:00.000Z',
      cached: false,
    },
  });
