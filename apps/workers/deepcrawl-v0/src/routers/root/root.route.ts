import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { createMessageObjectSchema } from 'stoker/openapi/schemas';

import { createRouter } from '@/lib/create-hono-app';
import { BaseErrorResponseSchema } from '@deepcrawl/types/common/response-schemas';

const router = createRouter().openapi(
  createRoute({
    tags: ['Deepcrawl API Root'],
    method: 'get',
    path: '/',
    operationId: 'getApiRoot',
    security: [],
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        createMessageObjectSchema('Welcome to Deepcrawl API'),
        'Deepcrawl API Root',
      ),
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
        BaseErrorResponseSchema,
        'Internal server error',
      ),
    },
  }),
  (c) => {
    return c.json(
      {
        message: 'Welcome to Deepcrawl API',
      },
      HttpStatusCodes.OK,
    );
  },
);

export default router;
