import {
  GetManyLogsOptionsSchema,
  GetManyLogsResponseSchema,
  GetOneLogOptionsSchema,
  GetOneLogResponseSchema,
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
 * Get multiple activity logs - POST method for complex query parameters
 */
export const getManyLogsContract = logsOC
  .route({
    tags,
    path: '/',
    method: 'POST',
    summary: 'Get activity logs',
    description: `Endpoint: POST \`api.deepcrawl.dev/logs\`\n\nRetrieve activity logs with original responses with request options. Returns paginated results with optional filtering by path, success status, and date range.`,
  })
  .input(GetManyLogsOptionsSchema)
  .output(GetManyLogsResponseSchema);

export type GetManyLogsOptions = Inputs['logs']['getMany'];
export type GetManyLogsResponse = Outputs['logs']['getMany'];

/* ----------------------------------------------GET-LOG---(Get single log)------------------------------------------------------- */

/**
 * Get a single activity log by ID - GET method with path parameter
 */
export const getOneLogContract = logsOC
  .route({
    tags,
    path: '/{id}',
    method: 'GET',
    summary: 'Get a single activity log',
    description: `Endpoint: GET \`api.deepcrawl.dev/logs/{id}\`\n\nRetrieve a single activity log with original response by ID.`,
  })
  .input(GetOneLogOptionsSchema)
  .output(GetOneLogResponseSchema);

export type GetOneLogOptions = Inputs['logs']['getOne'];
export type GetOneLogResponse = Outputs['logs']['getOne'];
