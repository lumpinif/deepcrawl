import { oc } from '@orpc/contract';

import * as z from 'zod/v4';
import type { Inputs, Outputs } from '.';

const tags = ['Read Website'];

export const readGETContract = oc
  .route({
    tags,
    path: '/',
    method: 'GET',
    summary: 'GET /read - Get page markdown content from a URL',
    description:
      'Directly return page markdown content from the request URL as a string response.',
  })
  .input(
    z.object({
      url: z.string(),
    }),
  )
  .output(z.string());

export type ReadGetMarkdownInput = Inputs['read']['getMarkdown'];
export type ReadGetMarkdownOutput = Outputs['read']['getMarkdown'];
