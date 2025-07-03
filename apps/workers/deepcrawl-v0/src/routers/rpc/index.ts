import { publicProcedures } from '@/orpc';
import { readGETHandler, readPOSTHandler } from './read/read.handler';

export const router = publicProcedures.router({
  read: {
    getMarkdown: readGETHandler,
    readWebsite: readPOSTHandler,
  },
});
