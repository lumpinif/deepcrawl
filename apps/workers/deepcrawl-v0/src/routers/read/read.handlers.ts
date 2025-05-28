import type { AppRouteHandler } from '@/lib/types';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { ReadErrorResponse, ReadSuccessResponse } from '@deepcrawl/types';
import { processReadRequest } from './read.processor';
import type { ReadGETRoute, ReadPOSTRoute } from './read.routes';

export const readGET: AppRouteHandler<ReadGETRoute> = async (c) => {
  const { url } = c.req.valid('query');

  try {
    const result = await processReadRequest(
      c,
      {
        url,
      },
      /* isStringResponse */
      true,
    );
    return c.text(result, HttpStatusCodes.OK);
  } catch (error) {
    const readErrorResponse: ReadErrorResponse = {
      success: false,
      targetUrl: url,
      error: 'Failed to read url',
    };

    return c.json(readErrorResponse, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const readPOST: AppRouteHandler<ReadPOSTRoute> = async (c) => {
  const {
    url,
    markdown: isMarkdown,
    cleanedHtml: isCleanedHtml,
    metadata: isMetadata,
    robots: isRobots,
    metadataOptions,
    rawHtml: isRawHtml,
  } = c.req.valid('json');

  try {
    const result = await processReadRequest(c, {
      url,
      markdown: isMarkdown,
      cleanedHtml: isCleanedHtml,
      metadata: isMetadata,
      robots: isRobots,
      metadataOptions,
      rawHtml: isRawHtml,
    });

    return c.json(result as ReadSuccessResponse, HttpStatusCodes.OK);
  } catch (error) {
    const readErrorResponse: ReadErrorResponse = {
      success: false,
      targetUrl: url,
      error: 'Failed to read url',
    };

    return c.json(readErrorResponse, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
};
