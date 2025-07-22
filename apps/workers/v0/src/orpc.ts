import { contract } from '@deepcrawl/contracts';
import { implement, ORPCError } from '@orpc/server';
import type { ORPCContext } from '@/lib/context';
import { logDebug } from './utils/loggers';

/**
 * This instance compatible with the original os from @orpc/server provides a type-safe interface to define procedures and supports features like Middleware and Context
 *
 * INFO: fully replaces the os from @orpc/server
 */
export const publicProcedures = implement(contract).$context<ORPCContext>();

export const authed = publicProcedures.use(({ context, next }) => {
  if (
    !context.var.session ||
    !context.var.session.user ||
    !context.var.session.session
  ) {
    throw new ORPCError('UNAUTHORIZED', {
      status: 401,
      cause: 'No session found',
      message: 'Authentication failed',
    });
  }

  logDebug(context.env, '✅ [ORPC] AUTHENTICATED');

  return next({
    context,
  });
});
