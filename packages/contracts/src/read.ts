import {
  ReadOptionsSchema,
  type ReadStringResponse,
  ReadSuccessResponseSchema,
} from '@deepcrawl/types';
import { oc } from '@orpc/contract';
import { z } from 'zod/v4';
import type { Inputs, Outputs } from '.';
import { errorSpec } from './errors';

const tags = ['Read URL'];

const readOC = oc.errors({
  RATE_LIMITED: errorSpec.RATE_LIMITED,
  READ_ERROR_RESPONSE: errorSpec.READ_ERROR_RESPONSE,
});

export const readGETContract = readOC
  .route({
    tags,
    path: '/',
    method: 'GET',
    summary: 'Get page markdown content',
    description: `Endpoint: GET \`api.deepcrawl.dev/read?url=example.com\`\n\nDirectly return page markdown content from the request URL as a string response.`,
  })
  .input(ReadOptionsSchema.pick({ url: true, cacheOptions: true }))
  // WORKAROUND: Return a Blob to bypass ORPC's JSON serialization since we'd like to return a text/markdown string response - but this introduces some latency
  .output(
    z
      .instanceof(Blob)
      .refine((blob) => blob.type === 'text/markdown; charset=utf-8', {
        message: 'Blob must have text/markdown; charset=utf-8 MIME type',
      })
      .meta({
        description: 'The page markdown content',
        examples: ['# Example Page\n\nMarkdown content...'],
      }),
  );

export type GetMarkdownOptions = Inputs['read']['getMarkdown'];
// export type GetMarkdownOutput = Outputs['read']['getMarkdown']; // Blob type is the workaround but we want to return a text/markdown string response
export type GetMarkdownResponse = ReadStringResponse;

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

export type ReadUrlOptions = Inputs['read']['readUrl'];
export type ReadUrlResponse = Outputs['read']['readUrl'];
