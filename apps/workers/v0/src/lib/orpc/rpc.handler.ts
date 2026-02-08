import { onError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import type { ORPCContext } from '@/lib/context';
import { router } from '@/routers';

export const rpcHandler = new RPCHandler<ORPCContext>(router, {
  interceptors: [
    onError((err: unknown) => {
      // Type guard for error-like objects
      const error = err as {
        code?: string;
        message?: string;
        status?: number;
        cause?: unknown;
      };

      const errorCode = error.code ?? 'UNKNOWN_ERROR';
      const errorMessage = error.message ?? 'No message';
      const errorStatus = error.status ?? 500;

      // Check for validation errors (most common issue)
      if (
        error.cause &&
        typeof error.cause === 'object' &&
        'issues' in error.cause
      ) {
        const issues = (
          error.cause as { issues?: Array<{ path: string[]; message: string }> }
        ).issues;
        if (issues && Array.isArray(issues) && issues.length > 0) {
          console.error(
            `❌ [RPC Validation Error] | ${errorCode}`,
            '\n  Issues:',
            issues
              .map(
                (issue) => `\n    • ${issue.path.join('.')}: ${issue.message}`,
              )
              .join(''),
          );
          return;
        }
      }

      // Regular errors
      console.error(
        `❌ [RPC Error] | ${errorCode}`,
        `\n  Status: ${errorStatus}`,
        `\n  Message: ${errorMessage}`,
      );
    }),
  ],
});
