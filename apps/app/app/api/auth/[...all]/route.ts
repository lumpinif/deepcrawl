import { authHandler } from '@deepcrawl/auth/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { POST, GET } = toNextJsHandler(authHandler);
