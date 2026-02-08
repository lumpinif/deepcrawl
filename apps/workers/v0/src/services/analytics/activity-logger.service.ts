import { activityLog, type NewActivityLog } from '@deepcrawl/db-d1';
import type { LinksErrorResponse } from '@deepcrawl/types/routers/links/types';
import type { ReadErrorResponse } from '@deepcrawl/types/routers/read/types';
import type { AppVariables, ORPCContext } from '@/lib/context';
import { logDebug, logError } from '@/utils/loggers';
import type { AnyResponseTypes } from '@/utils/tail-jobs/dynamics-handling';
import type { AnyRequestsOptions } from '@/utils/tail-jobs/post-processing';

interface LogActivityParams {
  path: string; // such as [ 'read', 'getMarkdown' ] = 'read-getMarkdown'
  requestId: string;
  success: boolean;
  cached: boolean;
  requestTimestamp: string;
  requestUrl: string;
  requestOptions: AnyRequestsOptions;
  executionTimeMs: number;
  responseHash: string | null;
  responseMetadata: Partial<AnyResponseTypes> | null;
  error?: ReadErrorResponse | LinksErrorResponse;
}

export class ActivityLogger {
  constructor(
    private db: AppVariables['dbd1'],
    private userId: string | null,
  ) {}

  /**
   * One-shot activity logging
   */
  async logActivity(params: LogActivityParams): Promise<void> {
    const {
      path,
      requestId,
      success,
      cached,
      requestTimestamp,
      requestUrl,
      requestOptions,
      executionTimeMs,
      responseHash,
      responseMetadata,
      error,
    } = params;

    const logData = {
      path,
      id: requestId,
      userId: this.userId,
      success,
      cached,
      requestTimestamp,
      requestUrl,
      requestOptions,
      executionTimeMs,
      responseHash,
      responseMetadata,
      error,
    } satisfies NewActivityLog;

    await this.db
      .insert(activityLog)
      .values(logData)
      .catch((error) => {
        logError('[ActivityLogger] Failed to log activity:', error);
        // Don't throw - logging failures shouldn't break the API
      });

    logDebug('[ActivityLogger] ✅ Activity logged successfully', {
      path,
      requestId,
      requestTimestamp,
    });
  }
}

/**
 * Factory function to create ActivityLogger from ORPC context
 * Use this in processors to get a configured logger
 */
export function createActivityLogger(c: ORPCContext): ActivityLogger {
  const userId = c.var.session?.user?.id ?? null;
  return new ActivityLogger(c.var.dbd1, userId);
}
