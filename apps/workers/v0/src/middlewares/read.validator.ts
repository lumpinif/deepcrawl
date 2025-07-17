import { ReadOptionsSchema as baseReadOptionsSchema } from '@deepcrawl/types/routers/read';
import z from 'zod/v4';
import { targetUrlHelper } from '@/utils/url/target-url-helper';

// Create a version of the schema without the url field
export const ReadOptionsSchema = baseReadOptionsSchema.extend({
  url: z
    .string()
    .transform((url) => {
      return targetUrlHelper(url);
    })
    .meta({
      description:
        'The valid URL to read. This URL will be validated and normalized.',
      examples: ['example.com', 'https://example.com'],
    }),
});
