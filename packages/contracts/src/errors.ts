import {
  LinksErrorResponseSchema,
  ReadErrorResponseSchema,
} from '@deepcrawl/types/index';
import type { ErrorMap, ErrorMapItem } from '@orpc/contract';
import { oo } from '@orpc/openapi';
import { z } from 'zod/v4';

const RateLimitedSchema = z.object({
  operation: z.string().meta({
    description: 'The operation that was rate limited',
    examples: ['read GET', 'read POST', 'links GET', 'links POST'],
  }),
  retryAfter: z.int()
    .meta({
      description: 'The time to retry in seconds',
      examples: [10],
    }),
});

export const errorConfig: {
  READ_ERROR_RESPONSE: ErrorMapItem<typeof ReadErrorResponseSchema>;
  LINKS_ERROR_RESPONSE: ErrorMapItem<typeof LinksErrorResponseSchema>;
  RATE_LIMITED: ErrorMapItem<typeof RateLimitedSchema>;
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
} satisfies ErrorMap;
