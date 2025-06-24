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

const tags = ['Read Website'];

export const readGETRoute = createRoute({
  path: '/',
  method: 'get',
  operationId: 'getMarkdown',
  description: 'Directly return page markdown content from the request URL.',
  'x-speakeasy-name-override': 'getMarkdown',
  request: {
    query: ReadOptionsSchema.pick({
      url: true,
    }),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: {
      content: {
        'text/markdown': {
          schema: {
            type: 'string',
            example:
              '# Example Page\n\nThis is an example markdown content extracted from the webpage.\n\n## Main Content\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.',
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
  operationId: 'readUrl',
  description: 'Returning full result object from the request URL.',
  'x-speakeasy-name-override': 'readUrl',
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
