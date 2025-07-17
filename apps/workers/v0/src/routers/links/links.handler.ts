import type {
  LinksErrorResponse,
  LinksSuccessResponse,
} from '@deepcrawl/types';
import { retry } from '@/middlewares/os.retry';
import { publicProcedures } from '@/orpc';
import {
  createLinksErrorResponse,
  processLinksRequest,
} from './links.processor';

export const linksGETHandler = publicProcedures
  .use(retry({ times: 3 }))
  .links.getLinks.handler(async ({ input, context: c, errors }) => {
    const { url, ...rest } = input;

    try {
      const result = await processLinksRequest(c, {
        url,
        ...rest,
      });

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

export const linksPOSTHandler = publicProcedures
  .use(retry({ times: 3 }))
  .links.extractLinks.handler(async ({ input, context: c, errors }) => {
    const { url, ...rest } = input;

    try {
      const result = await processLinksRequest(c, {
        url,
        ...rest,
      });

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
