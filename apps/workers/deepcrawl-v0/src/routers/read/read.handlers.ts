import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';

import type { AppRouteHandler } from '@/lib/types';

import type { GetReadRoute } from './read.routes';

export const getOne: AppRouteHandler<GetReadRoute> = async (c) => {
  const {
    url,
    markdown: isMarkdown,
    cleanedHtml: isCleanedHtml,
    metadata: isMetadata,
    robots: isRobots,
    metadataOptions,
    rawHtml: isRawHtml,
  } = c.req.valid('query');

  const testRes = JSON.stringify({
    url,
    markdown: isMarkdown,
    cleanedHtml: isCleanedHtml,
    metadata: isMetadata,
    robots: isRobots,
    metadataOptions,
    rawHtml: isRawHtml,
  });

  return c.text(testRes, HttpStatusCodes.OK);
};
