import { createRouter } from '@/lib/create-hono-app';

import * as handlers from './links.handlers';

import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';

import { LinksOptionsSchema } from '@/middlewares/links.validator';
import {
  LinksPostErrorResponseSchema,
  LinksPostSuccessResponseSchema,
} from '@deepcrawl/types/index';

const tags = ['Extract Links'];

export const linksGETRoute = createRoute({
  path: '/',
  method: 'get',
  operationId: 'extractLinksGet',
  description: 'Returning extracted links sitemap results for the request URL.',
  'x-speakeasy-name-override': 'getLinks',
  'x-speakeasy-group': 'deepcrawl',
  request: {
    query: LinksOptionsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      LinksPostSuccessResponseSchema,
      'Extracted links sitemap results for request URL',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      LinksPostErrorResponseSchema,
      'Bad request error',
    ),
  },
});

export const linksPOSTRoute = createRoute({
  path: '/',
  method: 'post',
  operationId: 'extractLinksPost',
  description: 'Returning extracted links sitemap results for the request URL.',
  'x-speakeasy-name-override': 'extractLinks',
  'x-speakeasy-group': 'deepcrawl',
  request: {
    body: jsonContentRequired(
      LinksOptionsSchema,
      '/links POST request body, links options schema',
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      LinksPostSuccessResponseSchema,
      'Extracted links sitemap results for request URL',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      LinksPostErrorResponseSchema,
      'Internal server error',
    ),
  },
});

export type LinksGETRoute = typeof linksGETRoute;
export type LinksPOSTRoute = typeof linksPOSTRoute;

const router = createRouter()
  // .openapi(linksGETRoute, handlers.linksGET)
  .openapi(linksPOSTRoute, handlers.linksPOST);

export default router;
