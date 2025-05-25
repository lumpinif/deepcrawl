import { pinoLogger as logger } from 'hono-pino';
import pino from 'pino';
import pretty from 'pino-pretty';

import type { AppContext } from '@/lib/types';
import { isProduction } from '@/utils/worker-env';

// eslint-disable-next-line unused-imports/no-unused-vars
export function pinoLogger({ c }: { c: AppContext }) {
  return logger({
    pino: pino(
      {
        level:
          // c.env.LOG_LEVEL ||
          'info',
      },
      isProduction(c) ? undefined : pretty(),
    ),
  });
}
