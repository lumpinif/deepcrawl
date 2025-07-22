import type { ReadErrorResponse, ReadSuccessResponse } from '@deepcrawl/types';
import { retry } from '@/middlewares/os.retry';
import { authed } from '@/orpc';
import { processReadRequest } from './read.processor';

export const readGETHandler = authed
  .use(retry({ times: 2 }))
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
  .use(retry({ times: 2 }))
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
