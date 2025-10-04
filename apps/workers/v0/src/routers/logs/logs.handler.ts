import { rateLimitMiddleware } from '@/middlewares/rate-limit.orpc';
import { authed } from '@/orpc';
import {
  getMultipleLogsWithReconstruction as getMultipleLogs,
  getSingleLogWithReconstruction as getSingleLog,
} from './logs.processor';

export const getMultipleLogsHandler = authed
  .use(rateLimitMiddleware({ operation: 'getLogs' }))
  .logs.getLogs.handler(async ({ input, context: c }) => {
    return getMultipleLogs(c, input);
  });

export const getSingleLogHandler = authed
  .use(rateLimitMiddleware({ operation: 'getLog' }))
  .logs.getLog.handler(async ({ input, context: c }) => {
    return getSingleLog(c, input);
  });
