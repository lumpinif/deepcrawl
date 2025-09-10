import type { ErrorHandler } from 'hono';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import type { StatusCode } from 'hono/utils/http-status';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { ZodError } from 'zod';
import type { $ZodIssue } from 'zod/v4/core';
import type { AppBindings, AppContext } from '@/lib/context';
import { isProduction } from '@/utils/worker-env';

interface ErrorIssue {
  code: string;
  message: string;
  path?: (string | number)[];
  totalHits?: number;
  cause?: unknown;
}

// TODO: INFER TO THE SOURCE OF TYPE PACKAGE LATER
interface ErrorResponse {
  success: boolean;
  targetUrl?: string;
  error:
    | string
    | {
        name: string;
        issues: ErrorIssue[] | $ZodIssue[];
      };
}

// Base error class with consistent structure
class BaseError extends Error {
  issues: ErrorIssue[];

  constructor(
    message: string,
    code: string,
    path?: (string | number)[],
    cause?: unknown,
    public totalHits?: number,
  ) {
    super(message);
    this.name = 'BaseError';
    this.issues = [
      {
        code,
        message,
        ...(path && { path }),
        totalHits: this.totalHits,
        cause,
      },
    ];
  }
}

export class ValidationError extends BaseError {
  constructor(
    message: string,
    path?: (string | number)[],
    public targetUrl?: string,
  ) {
    super(message, 'validation_error', path);
    this.targetUrl = targetUrl;
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends BaseError {
  constructor(
    message: string,
    path?: (string | number)[],
    cause?: unknown,
    totalHits?: number,
  ) {
    super(message, 'rate_limit_exceeded', path, cause, totalHits);
    this.name = 'RateLimitError';
  }
}

export class URLError extends BaseError {
  constructor(message: string, path?: (string | number)[], cause?: unknown) {
    super(message, 'invalid_url', path, cause);
    this.name = 'URLError';
  }
}

export function createErrorResponse(
  error: Error,
  c: AppContext,
): ErrorResponse {
  const isProd = isProduction(c);

  if (isProd) {
    return {
      success: false,
      targetUrl: error instanceof ValidationError ? error.targetUrl : undefined,
      error: error.message,
    };
  }

  return {
    success: false,
    targetUrl: error instanceof ValidationError ? error.targetUrl : undefined,
    error: {
      name: error.name,
      issues:
        error instanceof BaseError
          ? error.issues
          : error instanceof ZodError
            ? error.issues
            : [
                {
                  code: 'unknown_error',
                  message: error.message,
                  cause: error.cause,
                },
              ],
    },
  };
}

export const errorHandler: ErrorHandler<AppBindings> = (err, c) => {
  let status: StatusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR;

  const response = createErrorResponse(
    err instanceof Error ? err : new Error(String(err)),
    c,
  );

  if (err instanceof HTTPException) {
    status = err.status;
  } else if (err instanceof RateLimitError) {
    status = HttpStatusCodes.TOO_MANY_REQUESTS; // Too Many Requests
  } else if (
    err instanceof ZodError ||
    err instanceof ValidationError ||
    err instanceof URLError
  ) {
    status = HttpStatusCodes.BAD_REQUEST;
  }

  return c.json(response, status);
};

export const errorMiddleware = createMiddleware<AppBindings>(
  async (c, next) => {
    try {
      await next();
    } catch (error) {
      return errorHandler(
        error instanceof Error ? error : new Error(String(error)),
        c,
      );
    }
  },
);

// function formatZodError(error: ZodError): string {
//   return error.issues
//     .map((issue: ZodIssue) => {
//       const path = issue.path.join('.') || 'value';
//       let msg = `${path}: ${issue.message}`;
//       if (issue.code === 'invalid_type') {
//         const { expected, received } = issue;
//         msg += ` (expected ${expected}, received ${received})`;
//       }
//       return msg;
//     })
//     .join('; ');
// }

// export const defaultErrorHook: Hook<any, any, any, any> = (result, c) => {
//   if (!result.success) {
//     let message: string;
//     const isProd = isProduction(c);

//     if (result.error instanceof ZodError && isProd) {
//       // Format each issue as a readable sentence
//       message = formatZodError(result.error);
//     } else {
//       message =
//         typeof result.error === 'string'
//           ? result.error
//           : JSON.stringify(result.error);
//     }

//     return c.json(
//       {
//         success: result.success,
//         error: isProd ? message : result.error,
//       },
//       UNPROCESSABLE_ENTITY,
//     );
//   }
// };
