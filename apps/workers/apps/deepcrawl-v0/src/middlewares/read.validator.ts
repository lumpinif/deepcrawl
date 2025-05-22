import { targetUrlHelper } from '@/utils/url/target-url-helper';
import { readOptionsSchema as baseReadOptionsSchema } from '@deepcrawl-worker/types/routers/read';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// Create a version of the schema without the url field
export const readOptionsSchema = baseReadOptionsSchema.extend({
  url: z.string().transform((url) => targetUrlHelper(url)),
});

// export const readOptionsParamSchema = z.object({
//   url: z.string().transform((url) => targetUrlHelper(url)),
// });

/**
 * Middleware for validating read options in json body
 */
export const readPostValidator = () => zValidator('json', readOptionsSchema);

export const readQueryValidator = () => zValidator('query', readOptionsSchema);

// export const readParamValidator = () =>
//   zValidator('param', readOptionsParamSchema);
