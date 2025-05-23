import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import { readOptionsSchema } from '@/middlewares/read.validator';

const tags = ['Read'];

export const getRead = createRoute({
  path: '/read',
  method: 'get',
  request: {
    query: readOptionsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: {
      description: 'The markdown page content from the request URL',
    },
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(readOptionsSchema),
      'Invalid url error',
    ),
  },
});

export type GetReadRoute = typeof getRead;
