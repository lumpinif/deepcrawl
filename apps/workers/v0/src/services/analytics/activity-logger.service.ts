import type {
  ExtractLinksOptions,
  GetLinksOptions,
  GetMarkdownOptions,
  ReadUrlOptions,
} from '@deepcrawl/contracts';
import { activityLog, type NewActivityLog } from '@deepcrawl/db-d1';
import type { AppVariables, ORPCContext } from '@/lib/context';
import { logDebug, logError } from '@/utils/loggers';
import type { ResponseTypes } from '../response/response-record.service';

export type RequestsOptions =
  | GetMarkdownOptions
  | ReadUrlOptions
  | GetLinksOptions
  | ExtractLinksOptions;

interface LogActivityParams {
  path: string; // such as [ 'read', 'getMarkdown' ] = 'read-getMarkdown'
  requestId: string;
  success: boolean;
  cached: boolean;
  requestTimestamp: string;
  requestUrl: string;
  requestOptions: RequestsOptions;
  executionTimeMs: number;
  responseHash: string | null;
  responseMetadata: Partial<ResponseTypes>;
  error?: string;
}

export class ActivityLogger {
  constructor(
    private db: AppVariables['dbd1'],
    private userId: string,
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
  const userId = c.var.session?.user.id as string; // we know it must be a string because of the authed procedure
  return new ActivityLogger(c.var.dbd1, userId);
}
