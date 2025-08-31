import { activityLog, eq, type NewActivityLog } from '@deepcrawl/db-d1';
import type { LinksOptions, ReadOptions } from '@deepcrawl/types';
import { nanoid } from 'nanoid';
import type { AppVariables, ORPCContext } from '@/lib/context';
import { logError } from '@/utils/loggers';

export interface ActivityLogData {
  endpoint: 'read' | 'links';
  method: 'GET' | 'POST';
  targetUrl: string;
  requestUrl: string;
  optionsHash: string;
  requestOptions: ReadOptions | LinksOptions;
  success?: boolean;
  executionTimeMs?: number;
  cached?: boolean;
  error?: string;
}

export class ActivityLogger {
  constructor(
    private db: AppVariables['dbd1'],
    private userId?: string,
  ) {}

  /**
   * Start logging an activity - returns activity ID immediately (non-blocking for API)
   * The database insert happens in the background and won't delay the API response
   * Note: D1 serializes write operations internally due to SQLite single-writer constraint
   */
  startActivity(data: Omit<ActivityLogData, 'success'>): string {
    const activityId = nanoid();

    // Fire-and-forget database insert (no await)
    this.db
      .insert(activityLog)
      .values({
        id: activityId,
        userId: this.userId || null,
        endpoint: data.endpoint,
        method: data.method,
        success: false, // Will be updated on completion
        timestamp: new Date().toISOString(),
        targetUrl: data.targetUrl,
        requestUrl: data.requestUrl,
        optionsHash: data.optionsHash,
        requestOptions: data.requestOptions,
        executionTimeMs: null,
        cached: null,
        contentId: null, // Phase 2 - content storage
        error: null,
      } satisfies NewActivityLog)
      .catch((error) => {
        logError('[ActivityLogger] Failed to start activity:', error);
        // Don't throw - this runs in background
      });

    return activityId; // Return immediately
  }

  /**
   * Complete activity logging with results (non-blocking for API)
   * This is fire-and-forget and will not throw errors to prevent API disruption
   * Note: D1 serializes write operations internally due to SQLite single-writer constraint
   */
  completeActivity(
    activityId: string,
    result: Pick<
      ActivityLogData,
      'success' | 'executionTimeMs' | 'cached' | 'error'
    >,
  ): void {
    // Fire-and-forget database update (no await, no return)
    this.db
      .update(activityLog)
      .set({
        success: result.success ?? false,
        executionTimeMs: result.executionTimeMs || null,
        cached: result.cached || null,
        error: result.error || null,
      })
      .where(eq(activityLog.id, activityId))
      .catch((error) => {
        logError('[ActivityLogger] Failed to complete activity:', error);
        // Don't throw - logging failures shouldn't break the API
      });
  }

  /**
   * Alias for completeActivity (for backward compatibility)
   * Both methods are non-blocking for API (D1 serializes writes internally)
   */
  completeActivityAsync(
    activityId: string,
    result: Pick<
      ActivityLogData,
      'success' | 'executionTimeMs' | 'cached' | 'error'
    >,
  ): void {
    this.completeActivity(activityId, result);
  }

  /**
   * One-shot activity logging for simple cases (non-blocking for API)
   * Use when you have all data upfront
   * Note: D1 serializes write operations internally due to SQLite single-writer constraint
   */
  logActivity(data: ActivityLogData): void {
    const activityId = nanoid();

    // Fire-and-forget database insert (no await)
    this.db
      .insert(activityLog)
      .values({
        id: activityId,
        userId: this.userId || null,
        endpoint: data.endpoint,
        method: data.method,
        success: data.success ?? false,
        timestamp: new Date().toISOString(),
        targetUrl: data.targetUrl,
        requestUrl: data.requestUrl,
        optionsHash: data.optionsHash,
        requestOptions: data.requestOptions,
        executionTimeMs: data.executionTimeMs || null,
        cached: data.cached || null,
        contentId: null, // Phase 2 - content storage
        error: data.error || null,
      } satisfies NewActivityLog)
      .catch((error) => {
        logError('[ActivityLogger] Failed to log activity:', error);
        // Don't throw - logging failures shouldn't break the API
      });
  }

  /**
   * Alias for logActivity (for backward compatibility)
   * Both methods are non-blocking for API (D1 serializes writes internally)
   */
  logActivityAsync(data: ActivityLogData): void {
    this.logActivity(data);
  }
}

/**
 * Factory function to create ActivityLogger from ORPC context
 * Use this in processors to get a configured logger
 */
export function createActivityLogger(c: ORPCContext): ActivityLogger {
  const userId = c.var.session?.user?.id;
  return new ActivityLogger(c.var.dbd1, userId);
}
