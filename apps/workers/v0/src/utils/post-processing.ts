import type { LinksSuccessResponse } from '@deepcrawl/types/routers/links/types';
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

type Dynamics =
  | { metrics?: ReadSuccessResponse['metrics'] }
  | { timestamp?: string; executionTime?: string }
  | null;

interface ExtractedDynamicsResult {
  responseForHash: ResponseTypes | ReadSuccessResponseWithoutMetrics;
  dynamics: Dynamics;
}

function extractDynamicsForHash(
  path: readonly string[],
  response: ResponseTypes,
  success: boolean,
): ExtractedDynamicsResult {
  if (!success) return { responseForHash: response, dynamics: null };

  // read/readUrl: strip metrics
  if (path[0] === 'read' && path[1] === 'readUrl') {
    if (typeof response === 'object' && response && 'success' in response) {
      const r = response as ReadSuccessResponse;
      if (r.success === true) {
        const { metrics, ...rest } = r;
        return {
          responseForHash: rest as ReadSuccessResponseWithoutMetrics,
          dynamics: { metrics },
        };
      }
    }
  }

  // links without tree: strip timestamp and executionTime
  if (path[0] === 'links') {
    if (
      typeof response === 'object' &&
      response &&
      'success' in response &&
      (response as LinksSuccessResponse).success === true &&
      !(response as LinksSuccessResponse).tree
    ) {
      const { timestamp, executionTime, ...rest } =
        response as LinksSuccessResponse;
      return {
        responseForHash: rest as unknown as ResponseTypes,
        dynamics: { timestamp, executionTime },
      };
    }
  }

  return { responseForHash: response, dynamics: null };
}

export function schedulePostProcessing(
  c: ORPCContext,
  params: SchedulePostProcessingParams,
): void {
  const {
    path, // string[] such as [ 'read', 'getMarkdown' ]
    requestUrl,
    requestOptions,
    response,
    startedAt,
    requestTimestamp,
    success,
    error,
  } = params;

  const joinedPath = path.join('-'); // such as [ 'read', 'getMarkdown' ] => 'read-getMarkdown'

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

        // derive responseForHash and dynamics for activity metadata
        const { responseForHash, dynamics } = extractDynamicsForHash(
          path,
          response,
          success,
        );

        // create response hash (stable strategy for links)
        const responseHash =
          await responseRecordService.createStableResponseHash({
            path: joinedPath,
            optionsHash,
            requestUrl,
            response: responseForHash,
            linksRootKey: c.linksRootKey,
          });

        // store response record only if success is true
        if (success) {
          await responseRecordService.storeResponseRecord({
            path: joinedPath,
            optionsHash,
            requestUrl,
            responseHash,
            responseContent: responseForHash, // store canonical content for dedup
          });
        }

        // log activity
        await activityLogger.logActivity({
          path: joinedPath,
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
            ? response
            : ((dynamics as unknown) ?? null),
          error,
        });
      } catch (err) {
        logError(`[${joinedPath} Post-processing] failed`, err);
      }
    })(),
  );
}
