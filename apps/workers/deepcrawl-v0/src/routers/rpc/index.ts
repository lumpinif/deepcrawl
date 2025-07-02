import { publicProcedures } from '@/orpc';
import { readGetHandler } from './read.procedures';

export const router = publicProcedures.router({
  read: {
    getMarkdown: readGetHandler,
  },
});
