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
  ActivityLogEntry,
  GetLogsInput,
  GetLogsOutput,
} from '@deepcrawl/types/routers/logs';
import type { ORPCContext } from '@/lib/context';
import type { AnyRequestsOptions } from '@/utils/tail-jobs/post-processing';
import { reconstructResponse } from '@/utils/tail-jobs/response-reconstruction';

export async function getLogsWithReconstruction(
  c: ORPCContext,
  options: GetLogsInput,
): Promise<GetLogsOutput> {
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

      return {
        id: activity.id,
        requestOptions: activity.requestOptions,
        response: reconstructedResponse,
      };
    },
  );

  return {
    logs: reconstructedLogs,
  };
}
