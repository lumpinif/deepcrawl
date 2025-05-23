import { pinoLogger as logger } from 'hono-pino';
import pino from 'pino';
import pretty from 'pino-pretty';

import type { AppContext } from '@/lib/types';

// eslint-disable-next-line unused-imports/no-unused-vars
export function pinoLogger({ c }: { c: AppContext }) {
  return logger({
    pino: pino(
      {
        level:
          // c.env.LOG_LEVEL ||
          'info',
      },
      // c.env.NODE_ENV === 'production' ? undefined : pretty(),
      pretty(),
    ),
  });
}
