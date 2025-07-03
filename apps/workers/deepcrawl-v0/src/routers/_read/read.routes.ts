import { createRouter } from '@/lib/_zod-openapi/create-hono-app';

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
  tags,
  path: '/',
  method: 'get',
  operationId: 'getMarkdown',
  'x-speakeasy-group': '',
  'x-speakeasy-name-override': 'getMarkdown',
  description: 'Directly return page markdown content from the request URL.',
  'x-speakeasy-usage-example': {
    title: 'Get Markdown from a URL (GET)',
    description: 'Directly return page markdown content from the request URL.',
    position: 1,
  },
  request: {
    query: ReadOptionsSchema.pick({
      url: true,
    }),
  },
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
  tags,
  path: '/',
  method: 'post',
  operationId: 'readUrl',
  'x-speakeasy-group': '',
  'x-speakeasy-name-override': 'readUrl',
  description: 'Returning full result object from the request URL.',
  'x-speakeasy-usage-example': {
    title: 'Read URL (POST)',
    description: 'Returning full result object from the request URL.',
    position: 2,
  },
  request: {
    body: jsonContentRequired(
      ReadOptionsSchema,
      '/read POST request body, read options schema',
    ),
  },
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
