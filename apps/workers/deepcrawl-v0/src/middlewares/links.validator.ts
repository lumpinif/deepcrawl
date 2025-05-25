import { LinksOptionsSchema as baseLinkOptionsSchema } from '@deepcrawl/types/routers/links';
import { z } from '@hono/zod-openapi';
import { zValidator } from '@hono/zod-validator';

import { targetUrlHelper } from '@/utils/url/target-url-helper';

// Extend the base schema and override only the url field to use targetUrlHelper
export const LinksOptionsSchema = baseLinkOptionsSchema.extend({
  url: z.string().transform((url) => {
    return targetUrlHelper(url);
  }),
});

/**
 * Middleware for validating link options in json body
 */
export const linksPostValidator = () => zValidator('json', LinksOptionsSchema);

export function linksQueryValidator() {
  return zValidator('query', LinksOptionsSchema);
}
