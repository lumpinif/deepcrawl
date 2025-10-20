import {
  ExportResponseOptionsSchema,
  ExportResponseOutputSchema,
  GetManyLogsOptionsSchema,
  GetManyLogsResponseSchema,
  GetOneLogOptionsSchema,
  GetOneLogResponseSchema,
} from '@deepcrawl/types/schemas';
import { oc } from '@orpc/contract';
import { errorSpec } from '../errors';
import type { Inputs, Outputs } from '../index';

const tags = ['Activity Logs'];

const logsOC = oc.errors({
  RATE_LIMITED: errorSpec.RATE_LIMITED,
  LOGS_INVALID_DATE_RANGE: errorSpec.LOGS_INVALID_DATE_RANGE,
  LOGS_INVALID_SORT: errorSpec.LOGS_INVALID_SORT,
  INVALID_EXPORT_FORMAT: errorSpec.INVALID_EXPORT_FORMAT,
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
    description: `Endpoint: POST \`api.deepcrawl.dev/logs\`\n\nRetrieve activity logs with request options. Returns paginated results with optional filtering by path, success status, and date range.`,
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
    path: '/',
    method: 'GET',
    summary: 'Get a single activity log',
    description: `Endpoint: GET \`api.deepcrawl.dev/logs?id={requestId}\`\n\nRetrieve a single activity log with original response by ID.`,
  })
  .input(GetOneLogOptionsSchema)
  .output(GetOneLogResponseSchema);

export type GetOneLogOptions = Inputs['logs']['getOne'];
export type GetOneLogResponse = Outputs['logs']['getOne'];

/* ----------------------------------------------EXPORT-RESPONSE---(Export response by ID)------------------------------------------------------- */

/**
 * Export response data by request ID - GET method
 * Allows users to download specific parts of a response (JSON, markdown, or links tree)
 */
export const exportResponseContract = logsOC
  .route({
    tags,
    path: '/export',
    method: 'GET',
    summary: 'Export response by request ID',
    description: `Endpoint: GET \`api.deepcrawl.dev/logs/export?id={requestId}&format={format}\`\n\nExport the response data from a specific request. Choose format:\n- \`json\`: Full response object\n- \`markdown\`: Markdown string (from getMarkdown or readUrl)\n- \`links\`: Links tree data (from getLinks or extractLinks)`,
  })
  .input(ExportResponseOptionsSchema)
  .output(ExportResponseOutputSchema);

export type ExportResponseOptions = Inputs['logs']['exportResponse'];
export type ExportResponseOutput = Outputs['logs']['exportResponse'];

export * from './utils';
