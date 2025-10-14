import type {
  ActivityLogEntrySchema,
  ExportFormatSchema,
  GetManyLogsResponseMetaSchema,
  GetManyLogsSortColumnSchema,
  GetManyLogsSortDirectionSchema,
  JoinedRequestPathSchema,
} from '@deepcrawl/types/schemas';
import type { z } from 'zod/v4';

export type JoinedRequestPath = z.infer<typeof JoinedRequestPathSchema>;

/**
 * Type for a single activity log entry
 */
export type ActivityLogEntry = z.infer<typeof ActivityLogEntrySchema>;

/**
 * Type for the column to sort the logs by
 */
export type GetManyLogsSortColumn = z.infer<typeof GetManyLogsSortColumnSchema>;

/**
 * Type for the direction to sort the logs by
 */
export type GetManyLogsSortDirection = z.infer<
  typeof GetManyLogsSortDirectionSchema
>;

/**
 * Type for the meta data of the logs response
 */
export type GetManyLogsResponseMeta = z.infer<
  typeof GetManyLogsResponseMetaSchema
>;

/**
 * Type for the pagination input of the logs response
 */
export type GetManyLogsPaginationInput = {
  readonly limit?: unknown;
  readonly offset?: unknown;
};

/**
 * Type for the normalized pagination input of the logs response
 */
export type NormalizedGetManyLogsPagination = {
  readonly limit?: number;
  readonly offset?: number;
};

/** @note: DO NOT EXPORT THIS TYPE AS IT IS EXPORTED FROM @deepcrawl/contracts ALREADY
 * Type for get logs options (input)
 */
// export type GetManyLogsOptions = z.infer<typeof GetManyLogsOptionsSchema>;

/** @note: DO NOT EXPORT THIS TYPE AS IT IS EXPORTED FROM @deepcrawl/contracts ALREADY
 * Type for get logs response (output)
 */
// export type GetManyLogsResponse = z.infer<typeof GetManyLogsResponseSchema>;

/* ----------------------------------------------GET-LOG---(Get single log)------------------------------------------------------- */

/** @note: DO NOT EXPORT THIS TYPE AS IT IS EXPORTED FROM @deepcrawl/contracts ALREADY
 * Type for get log options (input)
 */
// export type GetOneLogOptions = z.infer<typeof GetOneLogOptionsSchema>;

/** @note: DO NOT EXPORT THIS TYPE AS IT IS EXPORTED FROM @deepcrawl/contracts ALREADY
 * Type for get log response (output)
 */
// export type GetOneLogResponse = z.infer<typeof GetOneLogResponseSchema>;

/* ----------------------------------------------EXPORT-RESPONSE---(Export response by ID)------------------------------------------------------- */

/**
 * Type for the export format of the logs response
 */
export type ExportFormat = z.infer<typeof ExportFormatSchema>;

/** @note: DO NOT EXPORT THIS TYPE AS IT IS EXPORTED FROM @deepcrawl/contracts ALREADY
 * Type for export response options (input)
 */
// export type ExportResponseOptions = z.infer<typeof ExportResponseOptionsSchema>;

/** @note: DO NOT EXPORT THIS TYPE AS IT IS EXPORTED FROM @deepcrawl/contracts ALREADY
 * Type for export response output
 */
// export type ExportResponseOutput = z.infer<typeof ExportResponseOutputSchema>;
