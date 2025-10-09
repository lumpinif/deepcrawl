import { rateLimitMiddleware } from '@/middlewares/rate-limit.orpc';
import { authed } from '@/orpc';
import {
  exportResponseByIdAndFormat as exportResponse,
  getManyLogsWithReconstruction as getManyLogs,
  getOneLogWithReconstruction as getSingleLog,
} from './logs.processor';

export const logsPOSTHandler = authed
  .use(rateLimitMiddleware({ operation: 'getMany' }))
  .logs.getMany.handler(async ({ input, context: c }) => {
    return getManyLogs(c, input);
  });

export const logsGETHandler = authed
  .use(rateLimitMiddleware({ operation: 'getOne' }))
  .logs.getOne.handler(async ({ input, context: c }) => {
    return getSingleLog(c, input);
  });

export const logsExportHandler = authed
  .use(rateLimitMiddleware({ operation: 'getOne' }))
  .logs.exportResponse.handler(async ({ input, context: c }) => {
    return exportResponse(c, input);
  });
