import type {
  GetManyLogsOptions,
  GetManyLogsResponse,
  GetMarkdownOptions,
  GetOneLogOptions,
  GetOneLogResponse,
} from '@deepcrawl/contracts';
import type { ActivityLog, ResponseRecord } from '@deepcrawl/db-d1';
import {
  activityLog,
  and,
  desc,
  eq,
  gte,
  lte,
  responseRecord,
} from '@deepcrawl/db-d1';
import type {
  LinksErrorResponse,
  LinksOptions,
  LinksSuccessResponse,
  ReadErrorResponse,
  ReadOptions,
  ReadSuccessResponse,
} from '@deepcrawl/types';
import type { ActivityLogEntry } from '@deepcrawl/types/routers/logs';
import { normalizeActivityLogsPagination } from '@deepcrawl/types/routers/logs';
import type { ORPCContext } from '@/lib/context';
import { reconstructResponse } from '@/utils/tail-jobs/response-reconstruction';

/**
 * Helper function to reconstruct a single activity log entry
 */
function reconstructLogEntry(
  activity: ActivityLog,
  record: ResponseRecord | null,
): ActivityLogEntry {
  const reconstructedResponse = reconstructResponse(record, activity);

  switch (activity.path) {
    case 'read-getMarkdown': {
      if (activity.success) {
        return {
          id: activity.id,
          path: 'read-getMarkdown',
          success: activity.success,
          requestOptions: activity.requestOptions as GetMarkdownOptions,
          response: reconstructedResponse as string,
          requestTimestamp: activity.requestTimestamp,
        };
      }

      const errorResponse = reconstructedResponse as
        | ReadErrorResponse
        | undefined;

      if (!errorResponse) {
        throw new Error(
          `Missing error payload for read-getMarkdown log ${activity.id}`,
        );
      }

      return {
        id: activity.id,
        path: 'read-getMarkdown',
        success: activity.success,
        requestOptions: activity.requestOptions as GetMarkdownOptions,
        response: errorResponse,
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
          response: reconstructedResponse as
            | ReadSuccessResponse
            | ReadErrorResponse,
        };
      }

      const errorResponse = reconstructedResponse as
        | ReadErrorResponse
        | undefined;

      if (!errorResponse) {
        throw new Error(
          `Missing error payload for read-readUrl log ${activity.id}`,
        );
      }

      return {
        id: activity.id,
        path: 'read-readUrl',
        success: activity.success,
        requestOptions: activity.requestOptions as ReadOptions,
        response: errorResponse,
      };
    }
    case 'links-getLinks': {
      if (activity.success) {
        return {
          id: activity.id,
          path: 'links-getLinks',
          success: activity.success,
          requestOptions: activity.requestOptions as LinksOptions,
          response: reconstructedResponse as
            | LinksSuccessResponse
            | LinksErrorResponse,
        };
      }

      const errorResponse = reconstructedResponse as
        | LinksErrorResponse
        | undefined;

      if (!errorResponse) {
        throw new Error(
          `Missing error payload for links-getLinks log ${activity.id}`,
        );
      }

      return {
        id: activity.id,
        path: 'links-getLinks',
        success: activity.success,
        requestOptions: activity.requestOptions as LinksOptions,
        response: errorResponse,
      };
    }
    case 'links-extractLinks': {
      if (activity.success) {
        return {
          id: activity.id,
          path: 'links-extractLinks',
          success: activity.success,
          requestOptions: activity.requestOptions as LinksOptions,
          response: reconstructedResponse as
            | LinksSuccessResponse
            | LinksErrorResponse,
        };
      }

      const errorResponse = reconstructedResponse as
        | LinksErrorResponse
        | undefined;

      if (!errorResponse) {
        throw new Error(
          `Missing error payload for links-extractLinks log ${activity.id}`,
        );
      }

      return {
        id: activity.id,
        path: 'links-extractLinks',
        success: activity.success,
        requestOptions: activity.requestOptions as LinksOptions,
        response: errorResponse,
      };
    }
    default:
      throw new Error(`Unknown path: ${activity.path}`);
  }
}

/**
 * Fetch multiple activity logs with pagination and filtering
 */
export async function getManyLogsWithReconstruction(
  c: ORPCContext,
  options: GetManyLogsOptions,
): Promise<GetManyLogsResponse> {
  const { limit = 20, offset = 0, path, success, startDate, endDate } = options;
  const normalized = normalizeActivityLogsPagination({ limit, offset });
  const sanitizedLimit = normalized.limit ?? 20;
  const sanitizedOffset = normalized.offset ?? 0;

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
  const logs = await c.var.dbd1
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
    .orderBy(desc(activityLog.requestTimestamp))
    .limit(sanitizedLimit)
    .offset(sanitizedOffset);

  // Reconstruct responses for each log entry
  const reconstructedLogs: ActivityLogEntry[] = logs.map(
    (log: {
      activityLog: ActivityLog;
      responseRecord: ResponseRecord | null;
    }) => reconstructLogEntry(log.activityLog, log.responseRecord),
  );

  // const validatedLogs: ActivityLogEntry[] = reconstructedLogs.map((entry) => {
  //   const result = ActivityLogEntrySchema.safeParse(entry);
  //   if (!result.success) {
  //     logDebug(
  //       '⛔ [ActivityLogEntry] ~ getManyLogsWithReconstruction ~ entry:',
  //       JSON.stringify(entry, null, 2),
  //     );
  //     logDebug('⛔ [ActivityLogEntry] Activity log entry validation failed', {
  //       id: entry.id,
  //       path: entry.path,
  //       issues: JSON.stringify(z.treeifyError(result.error), null, 2),
  //     });
  //     throw new Error('⛔ [ActivityLogEntry] Invalid activity log entry');
  //   }
  //   return result.data;
  // });

  return {
    logs: reconstructedLogs,
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
  return reconstructLogEntry(log.activityLog, log.responseRecord);
}
