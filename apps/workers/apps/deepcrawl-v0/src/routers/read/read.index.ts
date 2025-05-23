import { createRouter } from '@/lib/create-hono-app';

import * as handlers from './read.handlers';
import * as routes from './read.routes';

const router = createRouter().openapi(routes.getRead, handlers.getOne);

export default router;
