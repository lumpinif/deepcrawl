import type {
  GetLogsOptions,
  GetLogsResponse,
  GetMarkdownOptions,
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
import type { ORPCContext } from '@/lib/context';
import { reconstructResponse } from '@/utils/tail-jobs/response-reconstruction';

export async function getLogsWithReconstruction(
  c: ORPCContext,
  options: GetLogsOptions,
): Promise<GetLogsResponse> {
  const { limit = 20, offset = 0, path, success, startDate, endDate } = options;

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
    .limit(limit)
    .offset(offset);

  // Reconstruct responses for each log entry - only return id, requestOptions, and response
  const reconstructedLogs: ActivityLogEntry[] = logs.map(
    (log: {
      activityLog: ActivityLog;
      responseRecord: ResponseRecord | null;
    }) => {
      const activity = log.activityLog;
      const record = log.responseRecord;
      const reconstructedResponse = reconstructResponse(record, activity);

      switch (activity.path) {
        case 'read-getMarkdown':
          return {
            id: activity.id,
            path: 'read-getMarkdown',
            requestOptions: activity.requestOptions as GetMarkdownOptions, // ensure this matches GetMarkdownOptionsSchema
            response: reconstructedResponse as string, // ensure this is string
          };
        case 'read-readUrl':
          return {
            id: activity.id,
            path: 'read-readUrl',
            requestOptions: activity.requestOptions as ReadOptions, // ensure this matches ReadOptionsSchema
            response: reconstructedResponse as
              | ReadSuccessResponse
              | ReadErrorResponse, // ensure this matches ReadSuccessResponseSchema | ReadErrorResponseSchema
          };
        case 'links-getLinks':
          return {
            id: activity.id,
            path: 'links-getLinks',
            requestOptions: activity.requestOptions as LinksOptions, // ensure this matches LinksOptionsSchema
            response: reconstructedResponse as
              | LinksSuccessResponse
              | LinksErrorResponse, // ensure this matches LinksSuccessResponseSchema | LinksErrorResponseSchema
          };
        case 'links-extractLinks':
          return {
            id: activity.id,
            path: 'links-extractLinks',
            requestOptions: activity.requestOptions as LinksOptions, // ensure this matches LinksOptionsSchema
            response: reconstructedResponse as
              | LinksSuccessResponse
              | LinksErrorResponse, // ensure this matches LinksSuccessResponseSchema | LinksErrorResponseSchema
          };
        default:
          throw new Error(`Unknown path: ${activity.path}`);
      }
    },
  );

  return {
    logs: reconstructedLogs,
  };
}
