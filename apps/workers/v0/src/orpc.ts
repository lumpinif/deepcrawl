import { contract } from '@deepcrawl/contracts';
import { implement, ORPCError } from '@orpc/server';
import type { ORPCContext } from '@/lib/context';
import { retry } from './middlewares/retry.orpc';
import { resolveAuthMode } from './utils/auth-mode';
import { logDebug } from './utils/loggers';

/**
 * This instance compatible with the original os from @orpc/server provides a type-safe interface to define procedures and supports features like Middleware and Context
 *
 * INFO: fully replaces the os from @orpc/server
 */
export const publicProcedures = implement(contract).$context<ORPCContext>();

export const authed = publicProcedures
  .use(({ context, next }) => {
    const authMode = resolveAuthMode(context.env.AUTH_MODE);
    if (authMode === 'none') {
      return next({
        context: {
          ...context,
          var: {
            ...context.var,
            session: context.var.session ?? null,
          },
        },
      });
    }

    if (!(context.var.session?.user && context.var.session.session)) {
      throw new ORPCError('UNAUTHORIZED:', {
        status: 401,
        cause: 'No session found',
        message: 'Authentication failed',
      });
    }

    logDebug(
      '✅ AUTHENTICATED:',
      context.var.session.user.email || context.var.session.user.id,
    );

    return next({
      context: {
        ...context,
        var: {
          ...context.var,
          session: context.var.session,
        },
      },
    });
  })
  .use(retry({ times: 2 }));
