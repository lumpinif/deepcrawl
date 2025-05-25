import { ReadOptionsSchema as baseReadOptionsSchema } from '@deepcrawl/types/routers/read';
import { z } from '@hono/zod-openapi';

import { targetUrlHelper } from '@/utils/url/target-url-helper';

// Create a version of the schema without the url field
export const ReadOptionsSchema = baseReadOptionsSchema.extend({
  url: z.string().transform((url) => {
    return targetUrlHelper(url);
  }),
});
