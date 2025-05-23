import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { createMessageObjectSchema } from 'stoker/openapi/schemas';

import { createRouter } from '@/lib/create-hono-app';

const router = createRouter().openapi(
  createRoute({
    tags: ['Root'],
    method: 'get',
    path: '/',
    security: [],
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        createMessageObjectSchema('Welcome to Deepcrawl API'),
        'Deepcrawl API Root',
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
