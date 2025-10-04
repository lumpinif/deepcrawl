import {
  GetLogOptionsSchema,
  GetLogResponseSchema,
  GetLogsOptionsSchema,
  GetLogsResponseSchema,
} from '@deepcrawl/types/routers/logs';
import { oc } from '@orpc/contract';
import type { Inputs, Outputs } from '.';
import { errorSpec } from './errors';

const tags = ['Activity Logs'];

const logsOC = oc.errors({
  RATE_LIMITED: errorSpec.RATE_LIMITED,
});

/* ----------------------------------------------GET-LOGS---(Get multiple logs)------------------------------------------------------- */

/**
 * Get multiple activity logs
 */
export const getLogsContract = logsOC
  .route({
    tags,
    path: '/',
    method: 'GET',
    summary: 'Get activity logs',
    description: `Endpoint: GET \`api.deepcrawl.dev/logs\`\n\nRetrieve activity logs with original responses with request options. Returns paginated results with optional filtering by path, success status, and date range.`,
  })
  .input(GetLogsOptionsSchema)
  .output(GetLogsResponseSchema);

export type GetLogsOptions = Inputs['logs']['getLogs'];
export type GetLogsResponse = Outputs['logs']['getLogs'];

/* ----------------------------------------------GET-LOG---(Get single log)------------------------------------------------------- */

/**
 * Get a single activity log
 */
export const getLogContract = logsOC
  .route({
    tags,
    path: '/',
    method: 'GET',
    summary: 'Get a single activity log',
    description: `Endpoint: GET \`api.deepcrawl.dev/logs/log\`\n\nRetrieve a single activity log with original response.`,
  })
  .input(GetLogOptionsSchema)
  .output(GetLogResponseSchema);

export type GetLogOptions = Inputs['logs']['getLog'];
export type GetLogResponse = Outputs['logs']['getLog'];
