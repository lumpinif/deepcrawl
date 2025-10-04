import { rateLimitMiddleware } from '@/middlewares/rate-limit.orpc';
import { authed } from '@/orpc';
import { getLogsWithReconstruction } from './logs.processor';

export const logsGETHandler = authed
  .use(rateLimitMiddleware({ operation: 'getLogs' }))
  .logs.getLogs.handler(async ({ input, context: c }) => {
    return getLogsWithReconstruction(c, input);
  });
