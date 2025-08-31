import type {
  LinksErrorResponse,
  LinksSuccessResponse,
} from '@deepcrawl/types';
import { rateLimitMiddleware } from '@/middlewares/rate-limit.orpc';
import { authed } from '@/orpc';
import {
  createLinksErrorResponse,
  processLinksRequest,
} from './links.processor';

export const linksGETHandler = authed
  .use(rateLimitMiddleware({ operation: 'getLinks' }))
  .links.getLinks.handler(async ({ input, context: c, errors }) => {
    const { url, ...rest } = input;

    try {
      const result = await processLinksRequest(
        c,
        {
          url,
          ...rest,
        },
        true, // isGETRequest
      );

      return result as LinksSuccessResponse;
    } catch (error) {
      const err =
        error instanceof Error
          ? `${error.name}: ${error.message} - ${error.stack}`
          : String(error);

      const linksErrorResponse: LinksErrorResponse = createLinksErrorResponse({
        targetUrl: url,
        error: err,
        withTree: false,
        existingTree: undefined,
        tree: undefined,
      });

      throw errors.LINKS_ERROR_RESPONSE({
        data: linksErrorResponse,
      });
    }
  });

export const linksPOSTHandler = authed
  .use(rateLimitMiddleware({ operation: 'extractLinks' }))
  .links.extractLinks.handler(async ({ input, context: c, errors }) => {
    const { url, ...rest } = input;

    try {
      const result = await processLinksRequest(
        c,
        {
          url,
          ...rest,
        },
        false, // isGETRequest
      );

      return result as LinksSuccessResponse;
    } catch (error) {
      const err =
        error instanceof Error
          ? `${error.name}: ${error.message} - ${error.stack}`
          : String(error);

      const linksErrorResponse: LinksErrorResponse = createLinksErrorResponse({
        targetUrl: url,
        error: err,
        withTree: false,
        existingTree: undefined,
        tree: undefined,
      });

      throw errors.LINKS_ERROR_RESPONSE({
        data: linksErrorResponse,
      });
    }
  });
