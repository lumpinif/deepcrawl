import type { ErrorHandler } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';

import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

interface ErrorIssue {
  code: string;
  message: string;
  path?: (string | number)[];
  totalHits?: number;
  cause?: unknown;
}

// TODO: INFER TO THE SOURCE OF TYPE PACKAGE LATER
interface ErrorResponse {
  status?: 'completed' | 'failed' | 'pending' | 'queued';
  error: {
    name: string;
    issues: ErrorIssue[];
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
  constructor(message: string, path?: (string | number)[]) {
    super(message, 'validation_error', path);
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

export class BrowserError extends BaseError {
  constructor(message: string, path?: (string | number)[], cause?: unknown) {
    super(message, 'browser_error', path, cause);
    this.name = 'BrowserError';
  }
}

export class CrawlingError extends BaseError {
  constructor(
    message: string,
    public readonly url: string,
    public readonly cause?: unknown,
  ) {
    super(message, 'crawling_error', [url], cause);
    this.name = 'CrawlingError';
  }
}

export function createErrorResponse(error: Error): ErrorResponse {
  return {
    status: 'failed',
    error: {
      name: error.name,
      issues:
        error instanceof BaseError
          ? error.issues
          : error instanceof ZodError
            ? error.errors
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

export const errorHandler: ErrorHandler = (err, c) => {
  let status: StatusCode = 500;
  const response = createErrorResponse(
    err instanceof Error ? err : new Error(String(err)),
  );

  if (err instanceof HTTPException) {
    status = err.status;
  } else if (err instanceof RateLimitError) {
    status = 429; // Too Many Requests
  } else if (
    err instanceof ZodError ||
    err instanceof ValidationError ||
    err instanceof URLError
  ) {
    status = 400;
  }

  return c.json(response, status);
};

export const errorMiddleware = createMiddleware<{
  Bindings: CloudflareBindings;
}>(async (c, next) => {
  try {
    await next();
  } catch (error) {
    return errorHandler(
      error instanceof Error ? error : new Error(String(error)),
      c,
    );
  }
});
