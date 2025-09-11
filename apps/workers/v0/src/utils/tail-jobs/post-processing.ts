import type {
  ExtractLinksOptions,
  GetLinksOptions,
  GetMarkdownOptions,
  ReadUrlOptions,
} from '@deepcrawl/contracts';
import type {
  LinksErrorResponse,
  LinksSuccessResponse,
} from '@deepcrawl/types/routers/links/types';
import type {
  ReadErrorResponse,
  ReadStringResponse,
  ReadSuccessResponse,
} from '@deepcrawl/types/routers/read/types';
import type { ORPCContext } from '@/lib/context';
import { createActivityLogger } from '@/services/analytics/activity-logger.service';
import { createResponseRecordService } from '@/services/response/response-record.service';
import { logError } from '@/utils/loggers';
import { extractDynamicsForHash } from './dynamics-handling';

export type AnyRequestsOptions =
  | GetMarkdownOptions
  | ReadUrlOptions
  | GetLinksOptions
  | ExtractLinksOptions;

export interface PostProcessingParamsBase {
  path: readonly string[];
  requestUrl: string;
  requestOptions: AnyRequestsOptions; // all kinds of options unified together
  startedAt: number;
  requestTimestamp: string;
  success: boolean;
}

export interface PostProcessingParamsSuccess extends PostProcessingParamsBase {
  success: true;
  response: ReadStringResponse | ReadSuccessResponse | LinksSuccessResponse;
}

export interface PostProcessingParamsFailure extends PostProcessingParamsBase {
  success: false;
  response: ReadErrorResponse | LinksErrorResponse;
}

export type PostProcessingParams =
  | PostProcessingParamsFailure
  | PostProcessingParamsSuccess;

export function schedulePostProcessing(
  c: ORPCContext,
  params: PostProcessingParams,
): void {
  const {
    path, // string[] such as [ 'read', 'getMarkdown' ]
    requestUrl,
    requestOptions,
    success,
    response, // full response, when success is true, getMarkdown (ReadStringResponse), readUrl (ReadSuccessResponse), getLinks (LinksSuccessResponse), extractLinks (LinksSuccessResponse), when success is false, ReadErrorResponse, LinksErrorResponse
    startedAt,
    requestTimestamp,
  } = params;

  const joinedPath = path.join('-'); // such as [ 'read', 'getMarkdown' ] => 'read-getMarkdown'

  const activityLogger = createActivityLogger(c);
  const responseRecordService = createResponseRecordService(c);

  const isGetMarkdown = path[0] === 'read' && path[1] === 'getMarkdown';

  c.executionCtx.waitUntil(
    (async () => {
      try {
        // create request options hash
        const optionsHash =
          await responseRecordService.createRequestOptionsHash({
            requestOptions,
          });

        // derive responseForHash and dynamics for activity metadata
        const { responseForHash, dynamics } = extractDynamicsForHash({
          path,
          response,
          success,
        });

        // create response hash (stable strategy for links)
        const responseHash =
          await responseRecordService.createStableResponseHash({
            path: joinedPath,
            optionsHash,
            requestUrl,
            response: isGetMarkdown ? response : responseForHash,
            linksRootKey: c.linksRootKey,
          });

        // store response record only if success is true
        if (success) {
          await responseRecordService.storeResponseRecord({
            path: joinedPath,
            optionsHash,
            requestUrl,
            responseHash,
            responseContent: isGetMarkdown ? response : responseForHash, // store canonical content for dedup
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
          responseMetadata: success ? (dynamics ?? null) : response,
          error: success ? undefined : response,
        });
      } catch (err) {
        logError(`[${joinedPath} Post-processing] failed`, err);
      }
    })(),
  );
}
