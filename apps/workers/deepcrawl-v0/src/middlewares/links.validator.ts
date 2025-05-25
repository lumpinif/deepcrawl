import { linksOptionsSchema as baseLinkOptionsSchema } from '@deepcrawl/types/routers/links';
import { z } from '@hono/zod-openapi';
import { zValidator } from '@hono/zod-validator';

import { targetUrlHelper } from '@/utils/url/target-url-helper';
import { ValidationError } from './error';

// Extend the base schema and override only the url field to use targetUrlHelper
export const linksOptionsSchema = baseLinkOptionsSchema.extend({
  url: z.string().transform((url) => {
    try {
      return targetUrlHelper(url);
    } catch (error) {
      throw new ValidationError(
        error instanceof Error ? error.message : String(error),
        ['links.validator'],
        url,
      );
    }
  }),
});

/**
 * Middleware for validating link options in json body
 */
export const linksPostValidator = () => zValidator('json', linksOptionsSchema);

export function linksQueryValidator() {
  return zValidator('query', linksOptionsSchema);
}
