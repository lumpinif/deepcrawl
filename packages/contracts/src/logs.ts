import {
  GetLogsInputSchema,
  GetLogsOutputSchema,
} from '@deepcrawl/types/routers/logs';
import { oc } from '@orpc/contract';
import type { Inputs, Outputs } from '.';
import { errorSpec } from './errors';

const tags = ['Activity Logs'];

const logsOC = oc.errors({
  RATE_LIMITED: errorSpec.RATE_LIMITED,
});

export const getLogsContract = logsOC
  .route({
    tags,
    path: '/',
    method: 'GET',
    summary: 'Get activity logs',
    description: `Endpoint: GET \`api.deepcrawl.dev/logs\`\n\nRetrieve activity logs with original responses with request options. Returns paginated results with optional filtering by path, success status, and date range.`,
  })
  .input(GetLogsInputSchema)
  .output(GetLogsOutputSchema);

export type GetLogsInput = Inputs['logs']['getLogs'];
export type GetLogsOutput = Outputs['logs']['getLogs'];
