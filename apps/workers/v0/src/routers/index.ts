import { publicProcedures } from '@/orpc';
import { linksGETHandler, linksPOSTHandler } from './links/links.handler';
import {
  getMultipleLogsHandler,
  getSingleLogHandler,
} from './logs/logs.handler';
import { readGETHandler, readPOSTHandler } from './read/read.handler';

export const router = publicProcedures.router({
  read: {
    getMarkdown: readGETHandler,
    readUrl: readPOSTHandler,
  },
  links: {
    getLinks: linksGETHandler,
    extractLinks: linksPOSTHandler,
  },
  logs: {
    getLogs: getMultipleLogsHandler,
    getLog: getSingleLogHandler,
  },
});
