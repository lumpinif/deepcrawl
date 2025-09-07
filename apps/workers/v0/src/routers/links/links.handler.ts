import type {
  LinksErrorResponse,
  LinksSuccessResponse,
} from '@deepcrawl/types';
import { rateLimitMiddleware } from '@/middlewares/rate-limit.orpc';
import { authed } from '@/orpc';
import { createActivityLogger } from '@/utils/activity-logger';
import {
  createLinksErrorResponse,
  processLinksRequest,
} from './links.processor';

export const linksGETHandler = authed
  .use(rateLimitMiddleware({ operation: 'getLinks' }))

  .links.getLinks.handler(async ({ input, context: c, errors, path: p }) => {
    const { url, ...rest } = input;
    const startedAt = performance.now();
    const requestTimestamp = new Date().toISOString();
    const activityLogger = createActivityLogger(c);

    try {
      const result = await processLinksRequest(
        c,
        {
          url,
          ...rest,
        },
        true, // isGETRequest
      );

      // write activity log; use waitUntil so logging doesn't block the response but still completes reliably
      c.executionCtx.waitUntil(
        activityLogger.logActivity({
          path: p.join('-'),
          requestId: c.var.requestId,
          success: true,
          cached: c.cacheHit,
          requestTimestamp,
          requestUrl: url,
          requestOptions: input,
          executionTimeMs: performance.now() - startedAt,
        }),
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

      c.executionCtx.waitUntil(
        activityLogger.logActivity({
          path: p.join('-'),
          requestId: c.var.requestId,
          success: false,
          cached: c.cacheHit,
          requestTimestamp,
          requestUrl: url,
          requestOptions: input,
          executionTimeMs: performance.now() - startedAt,
        }),
      );

      throw errors.LINKS_ERROR_RESPONSE({
        data: linksErrorResponse,
      });
    }
  });

export const linksPOSTHandler = authed
  .use(rateLimitMiddleware({ operation: 'extractLinks' }))
  .links.extractLinks.handler(
    async ({ input, context: c, errors, path: p }) => {
      const { url, ...rest } = input;
      const startedAt = performance.now();
      const requestTimestamp = new Date().toISOString();
      const activityLogger = createActivityLogger(c);

      try {
        const result = await processLinksRequest(
          c,
          {
            url,
            ...rest,
          },
          false, // isGETRequest
        );

        c.executionCtx.waitUntil(
          activityLogger.logActivity({
            path: p.join('-'),
            requestId: c.var.requestId,
            success: true,
            cached: c.cacheHit,
            requestTimestamp,
            requestUrl: url,
            requestOptions: input,
            executionTimeMs: performance.now() - startedAt,
          }),
        );

        return result as LinksSuccessResponse;
      } catch (error) {
        const err =
          error instanceof Error
            ? `${error.name}: ${error.message} - ${error.stack}`
            : String(error);

        const linksErrorResponse: LinksErrorResponse = createLinksErrorResponse(
          {
            targetUrl: url,
            error: err,
            withTree: false,
            existingTree: undefined,
            tree: undefined,
          },
        );

        c.executionCtx.waitUntil(
          activityLogger.logActivity({
            path: p.join('-'),
            requestId: c.var.requestId,
            success: false,
            cached: c.cacheHit,
            requestTimestamp,
            requestUrl: url,
            requestOptions: input,
            executionTimeMs: performance.now() - startedAt,
          }),
        );

        throw errors.LINKS_ERROR_RESPONSE({
          data: linksErrorResponse,
        });
      }
    },
  );
