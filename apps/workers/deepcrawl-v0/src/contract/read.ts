import { ReadOptionsSchema } from '@/middlewares/read.validator';

import { oc } from '@orpc/contract';
import z from 'zod';
import type { Inputs, Outputs } from '.';

const tags = ['Read Website'];

export const readGETContract = oc
  .route({
    tags,
    path: '/',
    method: 'GET',
    summary: 'Get page markdown content from a URL',
    description: 'Directly return page markdown content from the request URL.',
  })
  .input(ReadOptionsSchema.pick({ url: true }))
  .output(z.string());

export type ReadGetMarkdownInput = Inputs['read']['getMarkdown'];
export type ReadGetMarkdownOutput = Outputs['read']['getMarkdown'];
