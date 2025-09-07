import type { ORPCContext } from '@/lib/context';
import type { RequestsOptions } from '@/services/analytics/activity-logger.service';
import { createActivityLogger } from '@/services/analytics/activity-logger.service';
import {
  createResponseRecordService,
  type ResponseTypes,
} from '@/services/response/response-record.service';
import { logError } from '@/utils/loggers';

interface SchedulePostProcessingParams {
  path: string;
  requestUrl: string;
  requestOptions: RequestsOptions;
  response: ResponseTypes;
  startedAt: number;
  requestTimestamp: string;
  success: boolean;
  error?: string;
}

export function schedulePostProcessing(
  c: ORPCContext,
  params: SchedulePostProcessingParams,
): void {
  const {
    path,
    requestUrl,
    requestOptions,
    response,
    startedAt,
    requestTimestamp,
    success,
    error,
  } = params;

  const responseRecordService = createResponseRecordService(c.var.dbd1);
  const activityLogger = createActivityLogger(c);

  c.executionCtx.waitUntil(
    responseRecordService
      .createRequestOptionsHash({ requestOptions })
      .then((optionsHash) => {
        return responseRecordService
          .createResponseHash({ path, optionsHash, requestUrl, response })
          .then((responseHash) =>
            responseRecordService
              .storeResponseRecord({
                path,
                optionsHash,
                requestUrl,
                response,
                responseHash,
              })
              .then(() =>
                activityLogger.logActivity({
                  path,
                  requestId: c.var.requestId,
                  success,
                  cached: c.cacheHit,
                  requestTimestamp,
                  requestUrl,
                  requestOptions,
                  executionTimeMs: performance.now() - startedAt,
                  responseHash,
                  error,
                }),
              ),
          );
      })
      .catch((err) => logError(`[${path} Post-processing] failed`, err)),
  );
}
