import type {
  LinksResponse,
  ReadPostResponse,
  ReadStringResponse,
} from '@deepcrawl/types';
import { z } from 'zod/v4';

/**
 * Schema for a single activity log entry with reconstructed response
 * Contains minimal fields needed for UI rendering:
 * - id: unique identifier for the log entry
 * - requestOptions: original request parameters
 * - response: the fully reconstructed original response (one of the API response types)
 */
export const ActivityLogEntrySchema = z.object({
  /**
   * Unique identifier for the activity log entry
   */
  id: z.string().meta({
    description: 'Unique identifier for the activity log entry',
  }),

  /**
   * Original request options/parameters
   */
  requestOptions: z.unknown().meta({
    description: 'Original request options/parameters',
  }),

  /**
   * Reconstructed original response - can be any of the API response types:
   * - ReadStringResponse (string) - from getMarkdown
   * - ReadPostResponse (ReadSuccessResponse | ReadErrorResponse) - from readUrl
   * - LinksResponse (LinksSuccessResponse | LinksErrorResponse) - from getLinks/extractLinks
   */
  response: z.unknown().meta({
    description:
      'Reconstructed original response - ReadStringResponse | ReadPostResponse | LinksResponse',
  }),
});

/**
 * Input schema for fetching activity logs
 */
export const GetLogsOptionsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20).optional().meta({
    description: 'Maximum number of logs to return',
  }),
  offset: z.number().int().min(0).default(0).optional().meta({
    description: 'Number of logs to skip for pagination',
  }),
  path: z.string().optional().meta({
    description:
      'Filter by endpoint path (e.g., "read-getMarkdown", "links-extractLinks")',
  }),
  success: z.boolean().optional().meta({
    description: 'Filter by success status',
  }),
  startDate: z.iso.datetime().optional().meta({
    description: 'Filter logs from this date (ISO 8601)',
  }),
  endDate: z.iso.datetime().optional().meta({
    description: 'Filter logs until this date (ISO 8601)',
  }),
});

/**
 * Output schema for activity logs response
 */
export const GetLogsResponseSchema = z.object({
  logs: z.array(ActivityLogEntrySchema).meta({
    description: 'Array of activity log entries with reconstructed responses',
  }),
});

/**
 * Type for a single activity log entry
 */
export type ActivityLogEntry = z.infer<typeof ActivityLogEntrySchema>;

/**
 * Type for get logs input
 */
export type GetLogsOptions = z.infer<typeof GetLogsOptionsSchema>;

/**
 * Type for get logs output
 */
export type GetLogsResponse = z.infer<typeof GetLogsResponseSchema>;
