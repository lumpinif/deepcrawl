import { retry } from '@/middlewares/os.retry';
import { publicProcedures } from '@/orpc';

export const readGetHandler = publicProcedures
  .use(retry({ times: 3 }))
  .read.getMarkdown.handler(async ({ input, context }) => {
    return 'markdown content';
  });
