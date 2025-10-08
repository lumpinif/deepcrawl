import {
  GET_MANY_LOGS_DEFAULT_LIMIT,
  GET_MANY_LOGS_DEFAULT_OFFSET,
  GET_MANY_LOGS_MAX_LIMIT,
  GET_MANY_LOGS_SORT_COLUMNS,
  GET_MANY_LOGS_SORT_DIRECTIONS,
} from '@deepcrawl/types/configs/default';
import { z } from 'zod/v4';
import {
  LinksErrorResponseSchema,
  LinksOptionsSchema,
  LinksSuccessResponseSchema,
} from '../links';
import {
  GetMarkdownOptionsSchema,
  ReadErrorResponseSchema,
  ReadOptionsSchema,
  ReadSuccessResponseSchema,
} from '../read';

/**
 * Schema for a joined request path
 * - read-getMarkdown
 * - read-readUrl
 * - links-getLinks
 * - links-extractLinks
 */
export const JoinedRequestPathSchema = z
  .enum([
    'read-getMarkdown',
    'read-readUrl',
    'links-getLinks',
    'links-extractLinks',
  ])
  .meta({
    description: 'Joined request path',
    examples: [
      'read-getMarkdown',
      'read-readUrl',
      'links-getLinks',
      'links-extractLinks',
    ],
  });

export type JoinedRequestPath = z.infer<typeof JoinedRequestPathSchema>;

/**
 * Discriminated union schema for activity log entries with full type safety
 *
 * The `path` field serves as the discriminator, enabling precise type narrowing
 * for both `requestOptions` and `response` based on the API endpoint:
 *
 * - **`read-getMarkdown`**: Returns markdown content as a string
 *   - `requestOptions`: {@link GetMarkdownOptionsSchema GetMarkdownOptions}
 *   - `response`: `string` (markdown content)
 *
 * - **`read-readUrl`**: Returns structured page content with metadata
 *   - `requestOptions`: {@link ReadOptionsSchema ReadOptions}
//  *   - `response`: {@link ReadSuccessResponseSchema ReadSuccessResponse} | {@link ReadErrorResponseSchema ReadErrorResponse}
 *
 * - **`links-getLinks`**: Extracts links from a page (GET request)
 *   - `requestOptions`: {@link LinksOptionsSchema LinksOptions}
 *   - `response`: {@link LinksSuccessResponseSchema LinksSuccessResponse} | {@link LinksErrorResponseSchema LinksErrorResponse}
 *
 * - **`links-extractLinks`**: Extracts links from a page (POST request)
 *   - `requestOptions`: {@link LinksOptionsSchema LinksOptions}
 *   - `response`: {@link LinksSuccessResponseSchema LinksSuccessResponse} | {@link LinksErrorResponseSchema LinksErrorResponse}
 *
 * @example Type narrowing with discriminated union
 * ```typescript
 * const log: ActivityLogEntry = await getLog(logId);
 *
 * // TypeScript narrows types based on path
 * if (log.path === 'read-getMarkdown') {
 *   log.response // Type: string
 *   log.requestOptions.url // Type: string (GetMarkdownOptions)
 * } else if (log.path === 'read-readUrl') {
 *   log.response // Type: ReadSuccessResponse | ReadErrorResponse
 *   log.requestOptions.markdown // Type: boolean | undefined (ReadOptions)
 * } else if (log.path === 'links-getLinks' || log.path === 'links-extractLinks') {
 *   log.response // Type: LinksSuccessResponse | LinksErrorResponse
 *   log.requestOptions.tree // Type: boolean | undefined (LinksOptions)
 * }
 * ```
 */
export const ActivityLogEntrySchema = z.discriminatedUnion('path', [
  z.object({
    /**
     * Unique identifier for the activity log entry
     */
    id: z.string().meta({
      description: 'Unique identifier (request ID) for the activity log entry',
    }),
    /**
     * Request path discriminator for `read-getMarkdown` endpoint
     *
     * When path is `'read-getMarkdown'`:
     * - `requestOptions` will be typed as {@link GetMarkdownOptionsSchema GetMarkdownOptions}
     * - `response` will be typed as `string` (markdown content) when success is true
     */
    path: z.literal('read-getMarkdown'),

    /**
     * Whether the request was successful
     */
    success: z.boolean(),
    /**
     * Original request options for the `getMarkdown` endpoint
     * @type {GetMarkdownOptions}
     */
    requestOptions: GetMarkdownOptionsSchema,
    // /**
    //  * Reconstructed markdown response (string content) or error on failure
    //  */
    // response: z.union([z.string(), ReadErrorResponseSchema]),
    /**
     * Request timestamp for getMarkdown endpoint only
     * @type {string}
     */
    requestTimestamp: z.string().meta({
      description: 'Request timestamp for getMarkdown',
      examples: ['2025-09-12T10:30:00.000Z'],
    }),
  }),
  z.object({
    /**
     * Unique identifier for the activity log entry
     */
    id: z.string().meta({
      description: 'Unique identifier for the activity log entry',
    }),
    /**
     * Request path discriminator for `read-readUrl` endpoint
     *
     * When path is `'read-readUrl'`:
     * - `requestOptions` will be typed as {@link ReadOptionsSchema ReadOptions}
     * - `response` will be typed as {@link ReadSuccessResponseSchema ReadSuccessResponse} | {@link ReadErrorResponseSchema ReadErrorResponse}
     */
    path: z.literal('read-readUrl'),
    /**
     * Whether the request was successful
     */
    success: z.boolean(),
    /**
     * Original request options for the `readUrl` endpoint
     * @type {ReadOptions}
     */
    requestOptions: ReadOptionsSchema,
    // /**
    //  * Reconstructed response for `readUrl` endpoint (success or error)
    //  * @type {ReadSuccessResponse | ReadErrorResponse}
    //  */
    // response: z.union([ReadSuccessResponseSchema, ReadErrorResponseSchema]),
    /**
     * Error response for the `readUrl` endpoint
     * @type {ReadErrorResponse}
     */
    error: ReadErrorResponseSchema.optional(),
    /**
     * Request timestamp for readUrl endpoint
     * @type {string}
     */
    requestTimestamp: z.string().meta({
      description: 'Request timestamp for readUrl',
      examples: ['2025-09-12T10:30:00.000Z'],
    }),
  }),
  z.object({
    /**
     * Unique identifier for the activity log entry
     */
    id: z.string().meta({
      description: 'Unique identifier for the activity log entry',
    }),
    /**
     * Request path discriminator for `links-getLinks` endpoint
     *
     * When path is `'links-getLinks'`:
     * - `requestOptions` will be typed as {@link LinksOptionsSchema LinksOptions}
     * - `response` will be typed as {@link LinksSuccessResponseSchema LinksSuccessResponse} | {@link LinksErrorResponseSchema LinksErrorResponse}
     */
    path: z.literal('links-getLinks'),
    /**
     * Whether the request was successful
     */
    success: z.boolean(),
    /**
     * Original request options for the `getLinks` endpoint
     * @type {LinksOptions}
     */
    requestOptions: LinksOptionsSchema,
    // /**
    //  * Reconstructed response for `getLinks` endpoint (success or error)
    //  * @type {LinksSuccessResponse | LinksErrorResponse}
    //  */
    // response: z.union([LinksSuccessResponseSchema, LinksErrorResponseSchema]),
    /**
     * Error response for the `getLinks` endpoint
     * @type {LinksErrorResponse}
     */
    error: LinksErrorResponseSchema.optional(),
    /**
     * Request timestamp for getLinks endpoint
     * @type {string}
     */
    requestTimestamp: z.string().meta({
      description: 'Request timestamp for getLinks',
      examples: ['2025-09-12T10:30:00.000Z'],
    }),
  }),
  z.object({
    /**
     * Unique identifier for the activity log entry
     */
    id: z.string().meta({
      description: 'Unique identifier for the activity log entry',
    }),
    /**
     * Request path discriminator for `links-extractLinks` endpoint
     *
     * When path is `'links-extractLinks'`:
     * - `requestOptions` will be typed as {@link LinksOptionsSchema LinksOptions}
     * - `response` will be typed as {@link LinksSuccessResponseSchema LinksSuccessResponse} | {@link LinksErrorResponseSchema LinksErrorResponse}
     */
    path: z.literal('links-extractLinks'),
    /**
     * Whether the request was successful
     */
    success: z.boolean(),
    /**
     * Original request options for the `extractLinks` endpoint
     * @type {LinksOptions}
     */
    requestOptions: LinksOptionsSchema,
    // /**
    //  * Reconstructed response for `extractLinks` endpoint (success or error)
    //  * @type {LinksSuccessResponse | LinksErrorResponse}
    //  */
    // response: z.union([LinksSuccessResponseSchema, LinksErrorResponseSchema]),
    /**
     * Error response for the `extractLinks` endpoint
     * @type {LinksErrorResponse}
     */
    error: LinksErrorResponseSchema.optional(),
    /**
     * Request timestamp for extractLinks endpoint
     * @type {string}
     */
    requestTimestamp: z.string().meta({
      description: 'Request timestamp for extractLinks',
      examples: ['2025-09-12T10:30:00.000Z'],
    }),
  }),
]);

/**
 * Type for a single activity log entry
 */
export type ActivityLogEntry = z.infer<typeof ActivityLogEntrySchema>;

/**
 * Input schema for fetching activity logs
 */
export const GetManyLogsSortColumnSchema = z
  .enum(GET_MANY_LOGS_SORT_COLUMNS)
  .meta({
    description: 'Column key to sort activity logs by',
    examples: GET_MANY_LOGS_SORT_COLUMNS,
  });

export type GetManyLogsSortColumn = z.infer<typeof GetManyLogsSortColumnSchema>;

export const GetManyLogsSortDirectionSchema = z
  .enum(GET_MANY_LOGS_SORT_DIRECTIONS)
  .meta({
    description: 'Sort direction',
    examples: GET_MANY_LOGS_SORT_DIRECTIONS,
  });

export type GetManyLogsSortDirection = z.infer<
  typeof GetManyLogsSortDirectionSchema
>;

export const GetManyLogsOptionsSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(GET_MANY_LOGS_MAX_LIMIT)
    .default(GET_MANY_LOGS_DEFAULT_LIMIT)
    .optional()
    .meta({
      description: 'Maximum number of logs to return',
    }),
  offset: z
    .number()
    .int()
    .min(0)
    .default(GET_MANY_LOGS_DEFAULT_OFFSET)
    .optional()
    .meta({
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
  orderBy: GetManyLogsSortColumnSchema.optional().meta({
    description:
      'Column to sort by. Defaults to requestTimestamp when omitted.',
  }),
  orderDir: GetManyLogsSortDirectionSchema.optional().meta({
    description: 'Sort direction. Defaults to desc when omitted.',
  }),
});

/**
 * Output schema for activity logs response
 */
export const GetManyLogsResponseMetaSchema = z.object({
  limit: z.number().int().min(1).meta({
    description: 'Effective limit applied to the result set',
  }),
  offset: z.number().int().min(0).meta({
    description: 'Effective offset applied to the result set',
  }),
  hasMore: z.boolean().meta({
    description: 'Indicates if more logs are available beyond this page',
  }),
  nextOffset: z.number().int().min(0).nullable().meta({
    description:
      'Offset to request the next page. Null when no additional data exists.',
  }),
  orderBy: GetManyLogsSortColumnSchema.meta({
    description: 'Column key used for sorting',
  }),
  orderDir: GetManyLogsSortDirectionSchema.meta({
    description: 'Sort direction applied to the result set',
  }),
  startDate: z.string().optional().meta({
    description:
      'Start date boundary (ISO 8601) that was applied after normalization.',
  }),
  endDate: z.string().optional().meta({
    description:
      'End date boundary (ISO 8601) that was applied after normalization.',
  }),
});

export type GetManyLogsResponseMeta = z.infer<
  typeof GetManyLogsResponseMetaSchema
>;

export const GetManyLogsResponseSchema = z
  .object({
    logs: z.array(ActivityLogEntrySchema).meta({
      description: 'Array of activity log entries with responses',
    }),
    meta: GetManyLogsResponseMetaSchema.meta({
      description: 'Pagination and filtering metadata for the response',
    }),
  })
  .meta({
    description: 'Paginated activity log entries with metadata',
  });

export interface GetManyLogsPaginationInput {
  readonly limit?: unknown;
  readonly offset?: unknown;
}

export interface NormalizedGetManyLogsPagination {
  readonly limit?: number;
  readonly offset?: number;
}

export function normalizeGetManyLogsPagination(
  input: GetManyLogsPaginationInput = {},
): NormalizedGetManyLogsPagination {
  const { limit, offset } = input;
  const limitNumber = Number(limit);
  const offsetNumber = Number(offset);
  const normalizedLimit = Number.isFinite(limitNumber)
    ? Math.min(Math.max(Math.trunc(limitNumber), 1), 100)
    : undefined;
  const normalizedOffset = Number.isFinite(offsetNumber)
    ? Math.max(Math.trunc(offsetNumber), 0)
    : undefined;
  return {
    limit: normalizedLimit,
    offset: normalizedOffset,
  };
}

/** @note: DO NOT EXPORT THIS TYPE AS IT IS EXPORTED FROM @deepcrawl/contracts ALREADY
 * Type for get logs options (input)
 */
// export type GetManyLogsOptions = z.infer<typeof GetManyLogsOptionsSchema>;

/** @note: DO NOT EXPORT THIS TYPE AS IT IS EXPORTED FROM @deepcrawl/contracts ALREADY
 * Type for get logs response (output)
 */
// export type GetManyLogsResponse = z.infer<typeof GetManyLogsResponseSchema>;

/* ----------------------------------------------GET-LOG---(Get single log)------------------------------------------------------- */

/**
 * Input schema for fetching a single activity log entry
 */
export const GetOneLogOptionsSchema = z.object({
  /**
   * Unique identifier (request ID) for the activity log entry
   */
  id: z.string().meta({
    description: 'Unique identifier (request ID) for the activity log entry',
  }),
});

/**
 * Output schema for a single activity log entry response
 */
export const GetOneLogResponseSchema = ActivityLogEntrySchema.meta({
  description: 'Activity log entry with the response',
});

/** @note: DO NOT EXPORT THIS TYPE AS IT IS EXPORTED FROM @deepcrawl/contracts ALREADY
 * Type for get log options (input)
 */
// export type GetOneLogOptions = z.infer<typeof GetOneLogOptionsSchema>;

/** @note: DO NOT EXPORT THIS TYPE AS IT IS EXPORTED FROM @deepcrawl/contracts ALREADY
 * Type for get log response (output)
 */
// export type GetOneLogResponse = z.infer<typeof GetOneLogResponseSchema>;
