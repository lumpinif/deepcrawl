import type { ReadErrorResponse, ReadSuccessResponse } from '@deepcrawl/types';
import { rateLimitMiddleware } from '@/middlewares/rate-limit.orpc';
import { authed } from '@/orpc';
import { schedulePostProcessing } from '@/utils/post-processing';
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

      const readErrorResponse: ReadErrorResponse = {
        success: false,
        targetUrl: url, // url here is actually the request url which might be different from the target url in the request processor TODO: consider making it consistent in the future from the ReadErrorResponseSchema
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
        error: errorMessage,
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

      const readErrorResponse: ReadErrorResponse = {
        success: false,
        targetUrl: url,
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
        error: errorMessage,
      });

      throw errors.READ_ERROR_RESPONSE({
        data: readErrorResponse,
      });
    }
  });
