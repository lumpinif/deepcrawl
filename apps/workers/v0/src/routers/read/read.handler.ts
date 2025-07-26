import type { ReadErrorResponse, ReadSuccessResponse } from '@deepcrawl/types';
import { rateLimitMiddleware } from '@/middlewares/rate-limit.orpc';
import { authed } from '@/orpc';
import { processReadRequest } from './read.processor';

export const readGETHandler = authed
  .use(rateLimitMiddleware({ operation: 'getMarkdown' }))
  .read.getMarkdown.handler(async ({ input, context: c, errors }) => {
    const { url } = input;

    try {
      const result = await processReadRequest(
        c,
        {
          url,
        },
        /* isStringResponse */
        true,
      );

      // WORKAROUND: Return a Blob with text/markdown MIME type to bypass ORPC's JSON serialization
      return new Blob([result], { type: 'text/markdown' });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      const readErrorResponse: ReadErrorResponse = {
        success: false,
        targetUrl: url,
        error: errorMessage,
      };

      throw errors.READ_ERROR_RESPONSE({
        data: readErrorResponse,
      });
    }
  });

export const readPOSTHandler = authed
  .use(rateLimitMiddleware({ operation: 'readURL' }))
  .read.readUrl.handler(async ({ input, context: c, errors }) => {
    const { url, ...rest } = input;

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

      return result as ReadSuccessResponse;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      const readErrorResponse: ReadErrorResponse = {
        success: false,
        targetUrl: url,
        error: errorMessage,
      };

      throw errors.READ_ERROR_RESPONSE({
        data: readErrorResponse,
      });
    }
  });
