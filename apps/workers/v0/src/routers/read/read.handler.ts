import type { ReadErrorResponse, ReadSuccessResponse } from '@deepcrawl/types';
import { rateLimitMiddleware } from '@/middlewares/rate-limit.orpc';
import { authed } from '@/orpc';
import { processReadRequest } from './read.processor';

export const readGETHandler = authed
  .use(rateLimitMiddleware({ operation: 'getMarkdown' }))
  .read.getMarkdown.handler(async ({ input, context: c, errors }) => {
    const handlerStart = Date.now();
    const { url } = input;

    console.log('[PERF] Workers readGETHandler started:', {
      url,
      operation: 'getMarkdown',
      timestamp: new Date().toISOString(),
      requestId: c.var.requestId,
    });

    try {
      const processingStart = Date.now();
      const result = await processReadRequest(
        c,
        {
          url,
        },
        /* isStringResponse */
        true,
      );
      const processingTime = Date.now() - processingStart;
      const totalHandlerTime = Date.now() - handlerStart;

      console.log('[PERF] Workers readGETHandler completed:', {
        url,
        operation: 'getMarkdown',
        processingTime,
        totalHandlerTime,
        responseSize: typeof result === 'string' ? result.length : 0,
        timestamp: new Date().toISOString(),
        requestId: c.var.requestId,
      });

      // WORKAROUND: Return a Blob with text/markdown MIME type to bypass ORPC's JSON serialization
      return new Blob([result], { type: 'text/markdown' });
    } catch (error) {
      const errorTime = Date.now() - handlerStart;

      console.error('[PERF] Workers readGETHandler error:', {
        url,
        operation: 'getMarkdown',
        errorTime,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        requestId: c.var.requestId,
      });

      const readErrorResponse: ReadErrorResponse = {
        success: false,
        targetUrl: url,
        error: 'Failed to read url',
      };

      throw errors.READ_ERROR_RESPONSE({
        data: readErrorResponse,
      });
    }
  });

export const readPOSTHandler = authed
  .use(rateLimitMiddleware({ operation: 'readURL' }))
  .read.readUrl.handler(async ({ input, context: c, errors }) => {
    const handlerStart = Date.now();
    const { url, ...rest } = input;

    console.log('[PERF] Workers readPOSTHandler started:', {
      url,
      operation: 'readUrl',
      options: Object.keys(rest),
      timestamp: new Date().toISOString(),
      requestId: c.var.requestId,
    });

    try {
      const processingStart = Date.now();
      const result = await processReadRequest(
        c,
        {
          url,
          ...rest,
        },
        /* isStringResponse */
        false,
      );
      const processingTime = Date.now() - processingStart;
      const totalHandlerTime = Date.now() - handlerStart;

      console.log('[PERF] Workers readPOSTHandler completed:', {
        url,
        operation: 'readUrl',
        processingTime,
        totalHandlerTime,
        timestamp: new Date().toISOString(),
        requestId: c.var.requestId,
      });

      return result as ReadSuccessResponse;
    } catch (error) {
      const errorTime = Date.now() - handlerStart;

      console.error('[PERF] Workers readPOSTHandler error:', {
        url,
        operation: 'readUrl',
        errorTime,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        requestId: c.var.requestId,
      });

      const readErrorResponse: ReadErrorResponse = {
        success: false,
        targetUrl: url,
        error: 'Failed to read url',
      };

      throw errors.READ_ERROR_RESPONSE({
        data: readErrorResponse,
      });
    }
  });
