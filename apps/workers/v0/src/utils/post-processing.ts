import type { ReadSuccessResponse } from '@deepcrawl/types/routers/read/types';
import type { ORPCContext } from '@/lib/context';
import type { RequestsOptions } from '@/services/analytics/activity-logger.service';
import { createActivityLogger } from '@/services/analytics/activity-logger.service';
import {
  createResponseRecordService,
  type ResponseTypes,
} from '@/services/response/response-record.service';
import { logError } from '@/utils/loggers';

interface SchedulePostProcessingParams {
  path: readonly string[];
  requestUrl: string;
  requestOptions: RequestsOptions;
  response: ResponseTypes;
  startedAt: number;
  requestTimestamp: string;
  success: boolean;
  error?: string;
}

type ReadSuccessResponseWithoutMetrics = Omit<ReadSuccessResponse, 'metrics'>;

interface ExtractedMetricsResult {
  responseForHash: ReadSuccessResponseWithoutMetrics | ResponseTypes;
  metrics?: ReadSuccessResponse['metrics'];
}

function extractReadUrlMetrics(
  path: readonly string[],
  response: ResponseTypes,
  success: boolean,
): ExtractedMetricsResult {
  const isReadUrl = path[1] === 'readUrl';
  if (!isReadUrl || !success) return { responseForHash: response };

  if (typeof response === 'object' && response && 'success' in response) {
    const r = response as ReadSuccessResponse | Record<string, unknown>;
    if ((r as ReadSuccessResponse).success === true) {
      const { metrics, ...rest } = r as ReadSuccessResponse;
      return {
        responseForHash: rest as ReadSuccessResponseWithoutMetrics,
        metrics,
      };
    }
  }

  return { responseForHash: response };
}

export function schedulePostProcessing(
  c: ORPCContext,
  params: SchedulePostProcessingParams,
): void {
  const {
    path, // such as [ 'read', 'getMarkdown' ]
    requestUrl,
    requestOptions,
    response,
    startedAt,
    requestTimestamp,
    success,
    error,
  } = params;

  const activityLogger = createActivityLogger(c);
  const responseRecordService = createResponseRecordService(c.var.dbd1);

  c.executionCtx.waitUntil(
    (async () => {
      try {
        // create request options hash
        const optionsHash =
          await responseRecordService.createRequestOptionsHash({
            requestOptions,
          });

        // derive responseForHash (strip metrics for read-readUrl success)
        const { responseForHash, metrics } = extractReadUrlMetrics(
          path,
          response,
          success,
        );

        // create response hash
        const responseHash = await responseRecordService.createResponseHash({
          path: path.join('-'),
          optionsHash,
          requestUrl,
          response: responseForHash,
        });

        // store response record only if success is true
        if (success) {
          await responseRecordService.storeResponseRecord({
            path: path.join('-'),
            optionsHash,
            requestUrl,
            responseContent: responseForHash,
            responseHash,
          });
        }

        // log activity
        await activityLogger.logActivity({
          path: path.join('-'),
          requestId: c.var.requestId,
          success,
          cached: c.cacheHit,
          requestTimestamp,
          requestUrl,
          requestOptions,
          executionTimeMs: performance.now() - startedAt,
          responseHash: success ? responseHash : null, // null if success is false
          /* dynamic response data fields such as metrics or full error response if success is false */
          responseMetadata: !success
            ? response // full error response
            : path[1] === 'readUrl'
              ? { metrics }
              : response,
          error,
        });
      } catch (err) {
        logError(`[${path.join('-')} Post-processing] failed`, err);
      }
    })(),
  );
}
