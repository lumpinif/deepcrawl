import { targetUrlHelper } from '@/utils/url/target-url-helper';
import { linksOptionsSchema as baseLinkOptionsSchema } from '@deepcrawl-worker/types/routers/links';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// Extend the base schema and override only the url field to use targetUrlHelper
export const linksOptionsSchema = baseLinkOptionsSchema.extend({
  url: z.string().transform((url) => targetUrlHelper(url)),
});

/**
 * Middleware for validating link options in json body
 */
export const linksPostValidator = () => zValidator('json', linksOptionsSchema);

export const linksQueryValidator = () =>
  zValidator('query', linksOptionsSchema);
