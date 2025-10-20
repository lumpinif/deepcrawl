import type { z } from 'zod/v4';
import type {
  ActivityLogEntrySchema,
  ExportFormatSchema,
  JoinedRequestPathSchema,
  ListLogsResponseMetaSchema,
  ListLogsSortColumnSchema,
  ListLogsSortDirectionSchema,
} from '../logs/schemas';

export type JoinedRequestPath = z.infer<typeof JoinedRequestPathSchema>;

/**
 * Type for a single activity log entry
 */
export type ActivityLogEntry = z.infer<typeof ActivityLogEntrySchema>;

/**
 * Type for the column to sort the logs by
 */
export type ListLogsSortColumn = z.infer<typeof ListLogsSortColumnSchema>;

/**
 * Type for the direction to sort the logs by
 */
export type ListLogsSortDirection = z.infer<typeof ListLogsSortDirectionSchema>;

/**
 * Type for the meta data of the logs response
 */
export type ListLogsResponseMeta = z.infer<typeof ListLogsResponseMetaSchema>;

/**
 * Type for the pagination input of the logs response
 */
export type ListLogsPaginationInput = {
  readonly limit?: unknown;
  readonly offset?: unknown;
};

/**
 * Type for the normalized pagination input of the logs response
 */
export type NormalizedListLogsPagination = {
  readonly limit?: number;
  readonly offset?: number;
};

/** @note: DO NOT EXPORT THIS TYPE AS IT IS EXPORTED FROM @deepcrawl/contracts ALREADY
 * Type for get logs options (input)
 */
// export type ListLogsOptions = z.infer<typeof ListLogsOptionsSchema>;

/** @note: DO NOT EXPORT THIS TYPE AS IT IS EXPORTED FROM @deepcrawl/contracts ALREADY
 * Type for list logs response (output)
 */
// export type ListLogsResponse = z.infer<typeof ListLogsResponseSchema>;

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
