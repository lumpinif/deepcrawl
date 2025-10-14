import {
  LinksErrorResponseSchema,
  ReadErrorResponseSchema,
} from '@deepcrawl/types/schemas';
import type { ErrorMap, ErrorMapItem } from '@orpc/contract';
import { oo } from '@orpc/openapi';
import { z } from 'zod/v4';

const RateLimitedSchema = z.object({
  operation: z.string().meta({
    description: 'The operation that was rate limited',
    examples: ['read GET', 'read POST', 'links GET', 'links POST'],
  }),
  retryAfter: z.int().meta({
    description: 'The time to retry in seconds',
    examples: [10],
  }),
});

const LogsInvalidDateRangeSchema = z.object({
  startDate: z.string().optional().meta({
    description: 'Start date provided by the caller',
  }),
  endDate: z.string().optional().meta({
    description: 'End date provided by the caller',
  }),
  message: z
    .string()
    .default('startDate must be less than or equal to endDate')
    .meta({
      description: 'Human-readable description of the validation failure',
    }),
});

const LogsInvalidSortSchema = z.object({
  orderBy: z.string().meta({
    description: 'Requested sort key that is not supported',
    examples: ['responseSize'],
  }),
  allowed: z.array(z.string()).meta({
    description: 'List of supported sort keys',
  }),
  message: z.string().default('Unsupported sort column requested').meta({
    description: 'Human-readable description of the validation failure',
  }),
});

const InvalidExportFormatSchema = z.object({
  id: z.string().meta({
    description: 'The request ID that was attempted to export',
  }),
  path: z
    .string()
    .optional()
    .meta({
      description: 'The API path that the request was made to',
      examples: ['read-getMarkdown', 'links-extractLinks'],
    }),
  format: z
    .string()
    .optional()
    .meta({
      description: 'The export format that was requested',
      examples: ['json', 'markdown', 'links'],
    }),
  message: z.string().meta({
    description: 'Human-readable description of the export format error',
  }),
});

export const errorConfig: {
  READ_ERROR_RESPONSE: ErrorMapItem<typeof ReadErrorResponseSchema>;
  LINKS_ERROR_RESPONSE: ErrorMapItem<typeof LinksErrorResponseSchema>;
  RATE_LIMITED: ErrorMapItem<typeof RateLimitedSchema>;
  LOGS_INVALID_DATE_RANGE: ErrorMapItem<typeof LogsInvalidDateRangeSchema>;
  LOGS_INVALID_SORT: ErrorMapItem<typeof LogsInvalidSortSchema>;
  INVALID_EXPORT_FORMAT: ErrorMapItem<typeof InvalidExportFormatSchema>;
} = {
  READ_ERROR_RESPONSE: {
    status: 500,
    message: 'Failed to read content from URL',
    data: ReadErrorResponseSchema,
  },
  LINKS_ERROR_RESPONSE: {
    status: 500,
    message: 'Failed to extract links from URL',
    data: LinksErrorResponseSchema,
  },
  RATE_LIMITED: {
    status: 429,
    message: 'Rate limit exceeded',
    data: RateLimitedSchema,
  },
  LOGS_INVALID_DATE_RANGE: {
    status: 400,
    message: 'Invalid logs date range',
    data: LogsInvalidDateRangeSchema,
  },
  LOGS_INVALID_SORT: {
    status: 400,
    message: 'Invalid logs sort option',
    data: LogsInvalidSortSchema,
  },
  INVALID_EXPORT_FORMAT: {
    status: 400,
    message: 'Invalid export format for the requested log',
    data: InvalidExportFormatSchema,
  },
} satisfies ErrorMap;

export const errorSpec = {
  RATE_LIMITED: oo.spec(errorConfig.RATE_LIMITED, (currentOperation) => ({
    ...currentOperation,
    responses: {
      ...currentOperation.responses,
      429: {
        ...currentOperation.responses?.[429],
        description: 'Rate limit exceeded',
      },
    },
  })),
  READ_ERROR_RESPONSE: oo.spec(
    errorConfig.READ_ERROR_RESPONSE,
    (currentOperation) => ({
      ...currentOperation,
      responses: {
        ...currentOperation.responses, // WORKAROUND: oo.spec() let us override the 200 response to return a text/markdown string response here
        200: {
          ...currentOperation.responses?.[200],
          description: 'Page markdown content',
          content: {
            'text/markdown': {
              schema: {
                type: 'string',
                description:
                  'NOTE - expecting a text/markdown string response instead of an application/json object',
                examples: [
                  '# Example Page\n\nThis is an example markdown content extracted from the webpage.\n\n## Main Content\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.',
                ],
              },
            },
          },
        },
        500: {
          ...currentOperation.responses?.[500],
          description: 'Content reading failed',
        },
      },
    }),
  ),
  LINKS_ERROR_RESPONSE: oo.spec(
    errorConfig.LINKS_ERROR_RESPONSE,
    (currentOperation) => ({
      ...currentOperation,
      responses: {
        ...currentOperation.responses,
        500: {
          ...currentOperation.responses?.[500],
          description: 'Links extraction failed',
        },
      },
    }),
  ),
  LOGS_INVALID_DATE_RANGE: oo.spec(
    errorConfig.LOGS_INVALID_DATE_RANGE,
    (currentOperation) => ({
      ...currentOperation,
      responses: {
        ...currentOperation.responses,
        400: {
          ...currentOperation.responses?.[400],
          description: 'Date range validation failed',
        },
      },
    }),
  ),
  LOGS_INVALID_SORT: oo.spec(
    errorConfig.LOGS_INVALID_SORT,
    (currentOperation) => ({
      ...currentOperation,
      responses: {
        ...currentOperation.responses,
        400: {
          ...currentOperation.responses?.[400],
          description: 'Sort option validation failed',
        },
      },
    }),
  ),
  INVALID_EXPORT_FORMAT: oo.spec(
    errorConfig.INVALID_EXPORT_FORMAT,
    (currentOperation) => ({
      ...currentOperation,
      responses: {
        ...currentOperation.responses,
        400: {
          ...currentOperation.responses?.[400],
          description: 'Export format validation failed',
        },
      },
    }),
  ),
} satisfies ErrorMap;
