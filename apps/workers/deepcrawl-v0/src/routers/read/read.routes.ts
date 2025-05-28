import { createRouter } from '@/lib/create-hono-app';

import * as handlers from './read.handlers';

import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';

import { ReadOptionsSchema } from '@/middlewares/read.validator';
import {
  ReadErrorResponseSchema,
  ReadSuccessResponseSchema,
} from '@deepcrawl/types/index';

const tags = ['Deepcrawl Read URL API'];

export const readGETRoute = createRoute({
  path: '/',
  method: 'get',
  description: 'Directly return page markdown content from the request URL.',
  request: {
    query: ReadOptionsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        'text/markdown': {
          schema: {
            type: 'string',
          },
        },
      },
      description: 'The page markdown content from the request URL',
    },
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      ReadErrorResponseSchema,
      'Bad request error',
    ),
  },
});

export const readPOSTRoute = createRoute({
  path: '/',
  method: 'post',
  description: 'Returning full result object from the request URL.',
  request: {
    body: jsonContentRequired(
      ReadOptionsSchema,
      '/read POST request body, read options schema',
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      ReadSuccessResponseSchema,
      'Read options schema',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      ReadErrorResponseSchema,
      'Internal server error',
    ),
  },
});

export type ReadGETRoute = typeof readGETRoute;
export type ReadPOSTRoute = typeof readPOSTRoute;

const router = createRouter()
  .openapi(readGETRoute, handlers.readGET)
  .openapi(readPOSTRoute, handlers.readPOST);

export default router;
