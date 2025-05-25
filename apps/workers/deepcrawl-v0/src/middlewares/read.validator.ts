import { ReadOptionsSchema as baseReadOptionsSchema } from '@deepcrawl/types/routers/read';
import { z } from '@hono/zod-openapi';
import { zValidator } from '@hono/zod-validator';

import { targetUrlHelper } from '@/utils/url/target-url-helper';
import { ValidationError } from './error';

// Create a version of the schema without the url field
export const ReadOptionsSchema = baseReadOptionsSchema.extend({
  url: z.string().transform((url) => {
    try {
      return targetUrlHelper(url);
    } catch (error) {
      throw new ValidationError(
        error instanceof Error ? error.message : String(error),
        ['read.validator'],
        url,
      );
    }
  }),
});

// export const readOptionsParamSchema = z.object({
//   url: z.string().transform((url) => targetUrlHelper(url)),
// });

/**
 * Middleware for validating read options in json body
 */
export const readPostValidator = () => zValidator('json', ReadOptionsSchema);

export const readQueryValidator = () => zValidator('query', ReadOptionsSchema);

// export const readParamValidator = () =>
//   zValidator('param', readOptionsParamSchema);
