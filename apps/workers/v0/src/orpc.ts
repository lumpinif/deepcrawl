import { contract } from '@deepcrawl/contracts';
import {
  // ORPCError,
  implement,
} from '@orpc/server';
import type { AppContext } from './lib/context';

/**
 * This instance compatible with the original os from @orpc/server provides a type-safe interface to define procedures and supports features like Middleware and Context
 *
 * INFO: fully replaces the os from @orpc/server
 */
export const publicProcedures = implement(contract).$context<AppContext>();

// export const authed = pub.use(({ context, next }) => {
//   if (!context.user) {
//     throw new ORPCError('UNAUTHORIZED')
//   }

//   return next({
//     context: {
//       user: context.user,
//     },
//   })
// })
