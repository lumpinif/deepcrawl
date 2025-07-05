import { publicProcedures } from '@/orpc';
import { linksGETHandler, linksPOSTHandler } from './links/links.handler';
import { readGETHandler, readPOSTHandler } from './read/read.handler';

export const router = publicProcedures.router({
  read: {
    getMarkdown: readGETHandler,
    readWebsite: readPOSTHandler,
  },
  links: {
    getLinks: linksGETHandler,
    extractLinks: linksPOSTHandler,
  },
});
