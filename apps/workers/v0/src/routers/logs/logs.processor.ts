import type {
  ExportResponseOptions,
  ExportResponseOutput,
  GetManyLogsOptions,
  GetManyLogsResponse,
  GetMarkdownOptions,
  GetOneLogOptions,
  GetOneLogResponse,
} from '@deepcrawl/contracts';
import { resolveGetManyLogsOptions } from '@deepcrawl/contracts';
import type { ActivityLog, ResponseRecord } from '@deepcrawl/db-d1';
import {
  activityLog,
  and,
  asc,
  desc,
  eq,
  gte,
  lte,
  responseRecord,
} from '@deepcrawl/db-d1';
import {
  GET_MANY_LOGS_DEFAULT_LIMIT,
  GET_MANY_LOGS_DEFAULT_OFFSET,
  GET_MANY_LOGS_DEFAULT_SORT_COLUMN,
  GET_MANY_LOGS_DEFAULT_SORT_DIRECTION,
  type LinksErrorResponse,
  type LinksOptions,
  type LinksSuccessResponse,
  type ReadErrorResponse,
  type ReadOptions,
  type ReadSuccessResponse,
} from '@deepcrawl/types';
import type {
  ActivityLogEntry,
  GetManyLogsSortColumn,
  GetManyLogsSortDirection,
} from '@deepcrawl/types/routers/logs';
import { normalizeGetManyLogsPagination } from '@deepcrawl/types/routers/logs';
import { ORPCError } from '@orpc/server';
import type { ORPCContext } from '@/lib/context';

import { reconstructResponse } from '@/utils/tail-jobs/response-reconstruction';

interface ReconstructLogEntryParams {
  activity: ActivityLog;
  record: ResponseRecord | null;
  enableResponseReconstruction: boolean;
}

/**
 * Helper function to reconstruct a single activity log entry
 */
function reconstructLogEntry({
  activity,
  record,
  enableResponseReconstruction: isResponse,
}: ReconstructLogEntryParams): ActivityLogEntry {
  switch (activity.path) {
    case 'read-getMarkdown': {
      if (activity.success) {
        return {
          id: activity.id,
          path: 'read-getMarkdown',
          success: activity.success,
          requestOptions: activity.requestOptions as GetMarkdownOptions,
          response: isResponse
            ? (reconstructResponse(record, activity) as string)
            : undefined,
          requestTimestamp: activity.requestTimestamp,
        };
      }

      return {
        id: activity.id,
        path: 'read-getMarkdown',
        success: activity.success,
        requestOptions: activity.requestOptions as GetMarkdownOptions,
        response: isResponse
          ? ((reconstructResponse(record, activity) as
              | ReadErrorResponse
              | undefined) ?? 'Missing error payload for read-getMarkdown log')
          : undefined,
        requestTimestamp: activity.requestTimestamp,
      };
    }
    case 'read-readUrl': {
      if (activity.success) {
        return {
          id: activity.id,
          path: 'read-readUrl',
          success: activity.success,
          requestOptions: activity.requestOptions as ReadOptions,
          response: isResponse
            ? (reconstructResponse(record, activity) as ReadSuccessResponse)
            : undefined,
          requestTimestamp: activity.requestTimestamp,
        };
      }

      return {
        id: activity.id,
        path: 'read-readUrl',
        success: activity.success,
        requestOptions: activity.requestOptions as ReadOptions,
        response: isResponse
          ? (reconstructResponse(record, activity) as
              | ReadErrorResponse
              | undefined)
          : undefined,
        requestTimestamp: activity.requestTimestamp,
      };
    }
    case 'links-getLinks': {
      if (activity.success) {
        return {
          id: activity.id,
          path: 'links-getLinks',
          success: activity.success,
          requestOptions: activity.requestOptions as LinksOptions,
          response: isResponse
            ? (reconstructResponse(record, activity) as LinksSuccessResponse)
            : undefined,
          requestTimestamp: activity.requestTimestamp,
        };
      }

      return {
        id: activity.id,
        path: 'links-getLinks',
        success: activity.success,
        requestOptions: activity.requestOptions as LinksOptions,
        response: isResponse
          ? (reconstructResponse(record, activity) as
              | LinksErrorResponse
              | undefined)
          : undefined,
        requestTimestamp: activity.requestTimestamp,
      };
    }
    case 'links-extractLinks': {
      if (activity.success) {
        return {
          id: activity.id,
          path: 'links-extractLinks',
          success: activity.success,
          requestOptions: activity.requestOptions as LinksOptions,
          response: isResponse
            ? (reconstructResponse(record, activity) as LinksSuccessResponse)
            : undefined,
          requestTimestamp: activity.requestTimestamp,
        };
      }

      return {
        id: activity.id,
        path: 'links-extractLinks',
        success: activity.success,
        requestOptions: activity.requestOptions as LinksOptions,
        response: isResponse
          ? (reconstructResponse(record, activity) as
              | LinksErrorResponse
              | undefined)
          : undefined,
        requestTimestamp: activity.requestTimestamp,
      };
    }
    default:
      throw new Error(`Unknown path: ${activity.path}`);
  }
}

type ActivityLogSortableColumn =
  | typeof activityLog.requestTimestamp
  | typeof activityLog.path
  | typeof activityLog.requestUrl
  | typeof activityLog.success
  | typeof activityLog.id;

const ORDERABLE_COLUMN_MAP: Record<
  GetManyLogsSortColumn,
  ActivityLogSortableColumn
> = {
  requestTimestamp: activityLog.requestTimestamp,
  path: activityLog.path,
  requestUrl: activityLog.requestUrl,
  success: activityLog.success,
  id: activityLog.id,
};

function resolveOrderExpressions(
  column: GetManyLogsSortColumn,
  direction: GetManyLogsSortDirection,
) {
  const targetColumn =
    ORDERABLE_COLUMN_MAP[column] ?? activityLog.requestTimestamp;
  const primary = direction === 'asc' ? asc(targetColumn) : desc(targetColumn);
  const secondary =
    direction === 'asc' ? asc(activityLog.id) : desc(activityLog.id);

  return [primary, secondary];
}

/**
 * Fetch multiple activity logs with pagination and filtering
 * @description Response reconstruction is not enabled by default
 */
export async function getManyLogsWithReconstruction(
  c: ORPCContext,
  options: GetManyLogsOptions,
): Promise<GetManyLogsResponse> {
  const resolvedOptions = resolveGetManyLogsOptions(options);
  const {
    path,
    success,
    startDate,
    endDate,
    orderBy = GET_MANY_LOGS_DEFAULT_SORT_COLUMN,
    orderDir = GET_MANY_LOGS_DEFAULT_SORT_DIRECTION,
  } = resolvedOptions;

  const startTimestamp = startDate ? Date.parse(startDate) : undefined;
  const endTimestamp = endDate ? Date.parse(endDate) : undefined;

  if (
    startTimestamp !== undefined &&
    endTimestamp !== undefined &&
    !Number.isNaN(startTimestamp) &&
    !Number.isNaN(endTimestamp) &&
    startTimestamp > endTimestamp
  ) {
    throw new ORPCError('LOGS_INVALID_DATE_RANGE', {
      status: 400,
      message: 'startDate must be less than or equal to endDate',
      data: {
        startDate,
        endDate,
      },
    });
  }
  const normalized = normalizeGetManyLogsPagination(resolvedOptions);
  const sanitizedLimit =
    normalized.limit ?? resolvedOptions.limit ?? GET_MANY_LOGS_DEFAULT_LIMIT;
  const sanitizedOffset =
    normalized.offset ?? resolvedOptions.offset ?? GET_MANY_LOGS_DEFAULT_OFFSET;

  if (!Object.hasOwn(ORDERABLE_COLUMN_MAP, orderBy)) {
    throw new ORPCError('LOGS_INVALID_SORT', {
      status: 400,
      message: 'Unsupported sort column requested',
      data: {
        orderBy,
        allowed: Object.keys(ORDERABLE_COLUMN_MAP),
      },
    });
  }

  // Get user ID from session
  const userId = c.var.session?.user?.id;
  if (!userId) {
    throw new Error('User ID not found in session');
  }

  // Build where conditions
  const conditions = [eq(activityLog.userId, userId)];

  if (path) {
    conditions.push(eq(activityLog.path, path));
  }

  if (success !== undefined) {
    conditions.push(eq(activityLog.success, success));
  }

  if (startDate) {
    conditions.push(gte(activityLog.requestTimestamp, startDate));
  }

  if (endDate) {
    conditions.push(lte(activityLog.requestTimestamp, endDate));
  }

  const whereClause = and(...conditions);

  // Get activity logs with response records
  const orderExpressions = resolveOrderExpressions(orderBy, orderDir);
  const fetchLimit = sanitizedLimit + 1;
  const rows = await c.var.dbd1
    .select({
      activityLog,
      responseRecord,
    })
    .from(activityLog)
    .leftJoin(
      responseRecord,
      eq(activityLog.responseHash, responseRecord.responseHash),
    )
    .where(whereClause)
    .orderBy(...orderExpressions)
    .limit(fetchLimit)
    .offset(sanitizedOffset);

  const hasMore = rows.length > sanitizedLimit;
  const paginatedRows = hasMore ? rows.slice(0, sanitizedLimit) : rows;

  // Reconstruct responses for each log entry
  const reconstructedLogs: ActivityLogEntry[] = paginatedRows.map(
    (log: {
      activityLog: ActivityLog;
      responseRecord: ResponseRecord | null;
    }) =>
      reconstructLogEntry({
        activity: log.activityLog,
        record: log.responseRecord,
        enableResponseReconstruction: false, // don't include response reconstruction in the payload
      }),
  );

  const nextOffset = hasMore ? sanitizedOffset + sanitizedLimit : null;

  return {
    logs: reconstructedLogs,
    meta: {
      limit: sanitizedLimit,
      offset: sanitizedOffset,
      hasMore,
      nextOffset,
      orderBy,
      orderDir,
      startDate,
      endDate,
    },
  };
}

/**
 * Fetch a single activity log by ID
 */
export async function getOneLogWithReconstruction(
  c: ORPCContext,
  options: GetOneLogOptions,
): Promise<GetOneLogResponse> {
  const { id } = options;

  // Get user ID from session
  const userId = c.var.session?.user?.id;
  if (!userId) {
    throw new Error('User ID not found in session');
  }

  // Get single activity log with response record
  const result = await c.var.dbd1
    .select({
      activityLog,
      responseRecord,
    })
    .from(activityLog)
    .leftJoin(
      responseRecord,
      eq(activityLog.responseHash, responseRecord.responseHash),
    )
    .where(and(eq(activityLog.id, id), eq(activityLog.userId, userId)))
    .limit(1);

  if (result.length === 0) {
    throw new Error('Activity log not found');
  }

  const log = result[0];
  return reconstructLogEntry({
    activity: log.activityLog,
    record: log.responseRecord,
    enableResponseReconstruction: true,
  });
}

/**
 * Export response data by request ID and format
 * Allows users to export specific parts of a response (JSON, markdown, or links tree)
 */
export async function exportResponseByIdAndFormat(
  c: ORPCContext,
  options: ExportResponseOptions,
): Promise<ExportResponseOutput> {
  const { id, format } = options;

  // Get user ID from session
  const userId = c.var.session?.user?.id;
  if (!userId) {
    throw new ORPCError('UNAUTHORIZED', {
      status: 401,
      message: 'User ID not found in session',
    });
  }

  // Get single activity log with response record
  const result = await c.var.dbd1
    .select({
      activityLog,
      responseRecord,
    })
    .from(activityLog)
    .leftJoin(
      responseRecord,
      eq(activityLog.responseHash, responseRecord.responseHash),
    )
    .where(and(eq(activityLog.id, id), eq(activityLog.userId, userId)))
    .limit(1);

  if (result.length === 0) {
    throw new ORPCError('NOT_FOUND', {
      status: 404,
      message: 'Activity log not found',
      data: { id },
    });
  }

  const log = result[0];
  const { activityLog: activity, responseRecord: record } = log;

  // Reconstruct the full response
  const response = reconstructResponse(record, activity);

  // Return based on format
  switch (format) {
    case 'json': {
      // Return the full response object
      return response;
    }

    case 'markdown': {
      // Extract markdown string based on path
      if (activity.path === 'read-getMarkdown') {
        // For getMarkdown, response is already a string
        return response as string;
      }

      if (activity.path === 'read-readUrl') {
        // For readUrl, extract markdown from response
        if (activity.success && typeof response === 'object') {
          const readResponse = response as ReadSuccessResponse;
          if (readResponse.markdown) {
            return readResponse.markdown;
          }
          throw new ORPCError('INVALID_EXPORT_FORMAT', {
            status: 400,
            message:
              'No markdown content available for this request. The original request did not include markdown extraction.',
            data: { id, path: activity.path },
          });
        }
        // Error response
        throw new ORPCError('INVALID_EXPORT_FORMAT', {
          status: 400,
          message: 'Cannot export markdown from error response',
          data: { id, path: activity.path },
        });
      }

      // Links endpoints don't have markdown
      throw new ORPCError('INVALID_EXPORT_FORMAT', {
        status: 400,
        message: `Markdown export is not supported for ${activity.path} endpoint`,
        data: { id, path: activity.path },
      });
    }

    case 'links': {
      // Extract links tree based on path
      if (
        activity.path === 'links-getLinks' ||
        activity.path === 'links-extractLinks'
      ) {
        if (activity.success && typeof response === 'object') {
          const linksResponse = response as LinksSuccessResponse;
          // Type narrowing: check if tree exists in response
          if ('tree' in linksResponse && linksResponse.tree) {
            return linksResponse.tree;
          }
          throw new ORPCError('INVALID_EXPORT_FORMAT', {
            status: 400,
            message:
              'No links tree available for this request. The original request did not include tree generation.',
            data: { id, path: activity.path },
          });
        }
        // Error response
        throw new ORPCError('INVALID_EXPORT_FORMAT', {
          status: 400,
          message: 'Cannot export links from error response',
          data: { id, path: activity.path },
        });
      }

      // Read endpoints don't have links tree
      throw new ORPCError('INVALID_EXPORT_FORMAT', {
        status: 400,
        message: `Links export is not supported for ${activity.path} endpoint`,
        data: { id, path: activity.path },
      });
    }

    default:
      throw new ORPCError('INVALID_EXPORT_FORMAT', {
        status: 400,
        message: `Unsupported export format: ${format}`,
        data: { id, format },
      });
  }
}
