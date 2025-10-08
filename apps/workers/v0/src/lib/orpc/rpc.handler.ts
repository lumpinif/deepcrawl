import { onError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import { CORSPlugin } from '@orpc/server/plugins';
import { CORS_OPTIONS } from '@/middlewares/cors.hono';
import { router } from '@/routers';

export const rpcHandler = new RPCHandler(router, {
  interceptors: [
    onError((err) => {
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
  plugins: [
    new CORSPlugin({
      origin: (origin) => origin,
      credentials: CORS_OPTIONS.credentials,
      maxAge: CORS_OPTIONS.maxAge,
      allowMethods: CORS_OPTIONS.allowMethods,
      allowHeaders: CORS_OPTIONS.allowHeaders,
      exposeHeaders: CORS_OPTIONS.exposeHeaders,
    }),
  ],
});
