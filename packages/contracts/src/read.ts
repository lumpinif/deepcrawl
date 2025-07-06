import {
  ReadErrorResponseSchema,
  ReadOptionsSchema,
  ReadSuccessResponseSchema,
} from '@deepcrawl/types';
import { oc } from '@orpc/contract';
import { oo } from '@orpc/openapi';
import * as z from 'zod/v4';
import type { Inputs, Outputs } from '.';

const tags = ['Read Website'];

const errorConfig = {
  READ_ERROR_RESPONSE: {
    status: 500,
    message: 'Failed to read content from URL',
    data: ReadErrorResponseSchema,
  },
};

const readOC = oc.errors({
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
});

export const readGETContract = readOC
  .route({
    tags,
    path: '/',
    method: 'GET',
    summary: 'Get page markdown content',
    description: `Endpoint: GET \`api.deepcrawl.dev/read?url=example.com\`\n\nDirectly return page markdown content from the request URL as a string response.`,
  })
  .input(ReadOptionsSchema.pick({ url: true }))
  // WORKAROUND: Return a Blob to bypass ORPC's JSON serialization since we'd like to return a text/markdown string response
  .output(
    z.instanceof(Blob).refine((blob) => blob.type === 'text/markdown', {
      message: 'Blob must have text/markdown MIME type',
    }),
  );

export type ReadGETInput = Inputs['read']['getMarkdown'];
export type ReadGETOutput = Outputs['read']['getMarkdown'];

export const readPOSTContract = readOC
  .route({
    tags,
    path: '/',
    method: 'POST',
    summary: 'Read a URL',
    description: `Endpoint: POST \`api.deepcrawl.dev/read\`\n\nRead a URL and return the full detailed result object. This is a POST request can handle more complex requests and use cases.`,
  })
  .input(ReadOptionsSchema)
  .output(ReadSuccessResponseSchema);

export type ReadPOSTInput = Inputs['read']['readWebsite'];
export type ReadPOSTOutput = Outputs['read']['readWebsite'];
