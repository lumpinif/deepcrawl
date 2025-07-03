import { env } from 'cloudflare:workers';
import {
  ReadErrorResponseSchema,
  ReadOptionsSchema,
  ReadSuccessResponseSchema,
} from '@deepcrawl/types';
import { oc } from '@orpc/contract';
import * as z from 'zod/v4';
import type { Inputs, Outputs } from '.';

const tags = ['Read Website'];

const readOC = oc.errors({
  READ_ERROR_RESPONSE: {
    status: 500,
    message: 'Failed to read content from URL',
    data: ReadErrorResponseSchema,
  },
});

export const readGETContract = readOC
  .route({
    tags,
    path: '/',
    method: 'GET',
    summary: 'Get page markdown content',
    description: `Endpoint: GET ${env.API_URL}/read?url=example.com\n\nDirectly return page markdown content from the request URL as a string response.`,
  })
  .input(ReadOptionsSchema.pick({ url: true }))
  // WORKAROUND: Return a Blob to bypass ORPC's JSON serialization since we'd like to return a text/markdown string response
  .output(
    z.instanceof(Blob).meta({
      description:
        'NOTE: expecting a string response instead of an application/json object. The page markdown content from the request URL',
      examples: [
        '# Example Page\n\nThis is an example markdown content extracted from the webpage.\n\n## Main Content\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit.',
      ],
    }),
  );

export type ReadGETInput = Inputs['read']['getMarkdown'];
export type ReadGETOutput = Outputs['read']['getMarkdown'];

export const readPOSTContract = readOC
  .route({
    tags,
    path: '/',
    method: 'POST',
    summary: 'Read a URL and retrieve the full result object',
    description: `Endpoint: POST ${env.API_URL}/read\n\nRead a URL and return the full detailed result object. This is a POST request can handle more complex requests and use cases.`,
  })
  .input(ReadOptionsSchema)
  .output(ReadSuccessResponseSchema);

export type ReadPOSTInput = Inputs['read']['readWebsite'];
export type ReadPOSTOutput = Outputs['read']['readWebsite'];
