import type { ReadErrorResponse, ReadSuccessResponse } from '@deepcrawl/types';
import { rateLimitMiddleware } from '@/middlewares/rate-limit.orpc';
import { authed } from '@/orpc';
import { schedulePostProcessing } from '@/utils/tail-jobs/post-processing';
import { targetUrlHelper } from '@/utils/url/target-url-helper';
import { processReadRequest } from './read.processor';

export const readGETHandler = authed
  .use(rateLimitMiddleware({ operation: 'getMarkdown' }))
  .read.getMarkdown.handler(async ({ input, context: c, errors, path }) => {
    const { url, ...rest } = input;
    const startedAt = performance.now();
    const requestTimestamp = new Date().toISOString();

    try {
      const result = await processReadRequest(
        c,
        {
          url,
          ...rest, // cacheOptions
        },
        /* isStringResponse */
        true,
      ); // result here is a string for getMarkdown path and cached status is stored in c.cacheHit

      schedulePostProcessing(c, {
        path,
        requestUrl: url,
        requestOptions: input,
        response: result,
        startedAt,
        requestTimestamp,
        success: true,
      });

      const content =
        typeof result === 'string' ? result : JSON.stringify(result);
      // WORKAROUND: Return a Blob with text/markdown MIME type to bypass ORPC's JSON serialization
      return new Blob([content], { type: 'text/markdown; charset=utf-8' });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      const targetUrl = targetUrlHelper(url, true); // normalized target url for the `targetUrl` and response hash

      const readErrorResponse: ReadErrorResponse = {
        requestId: c.var.requestId,
        success: false,
        requestUrl: url,
        targetUrl: targetUrl,
        timestamp: requestTimestamp,
        error: errorMessage,
      };

      schedulePostProcessing(c, {
        path,
        requestUrl: url,
        requestOptions: input,
        response: readErrorResponse,
        startedAt,
        requestTimestamp,
        success: false,
      });

      throw errors.READ_ERROR_RESPONSE({
        data: readErrorResponse,
      });
    }
  });

export const readPOSTHandler = authed
  .use(rateLimitMiddleware({ operation: 'readURL' }))
  .read.readUrl.handler(async ({ input, context: c, errors, path }) => {
    const { url, ...rest } = input;
    const startedAt = performance.now();
    const requestTimestamp = new Date().toISOString();

    try {
      const result = await processReadRequest(
        c,
        {
          url,
          ...rest,
        },
        /* isStringResponse */
        false,
      );

      schedulePostProcessing(c, {
        path,
        requestUrl: url,
        requestOptions: input,
        response: result,
        startedAt,
        requestTimestamp,
        success: true,
      });

      return result as ReadSuccessResponse;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      const targetUrl = targetUrlHelper(url, true); // normalized target url for the `targetUrl` and response hash

      const readErrorResponse: ReadErrorResponse = {
        requestId: c.var.requestId,
        success: false,
        requestUrl: url,
        targetUrl: targetUrl,
        timestamp: requestTimestamp,
        error: errorMessage,
      };

      schedulePostProcessing(c, {
        path,
        requestUrl: url,
        requestOptions: input,
        response: readErrorResponse,
        startedAt,
        requestTimestamp,
        success: false,
      });

      throw errors.READ_ERROR_RESPONSE({
        data: readErrorResponse,
      });
    }
  });
