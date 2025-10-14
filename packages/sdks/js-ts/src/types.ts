import type { ExtractLinksOptions } from '@deepcrawl/contracts/links';
import type {
  GetMarkdownOptions,
  ReadUrlOptions,
} from '@deepcrawl/contracts/read';
import type { LinksErrorResponse, ReadErrorResponse } from '@deepcrawl/types';
import type { ClientRetryPluginContext } from '@orpc/client/plugins';
import type { ContractRouterClient as CRC } from '@orpc/contract';
import type { Agent } from 'https';

export type { ContractRouterClient } from '@orpc/contract';

export type OptionsWithoutUrl<
  T extends GetMarkdownOptions | ReadUrlOptions | ExtractLinksOptions,
> = {
  [K in keyof T as K extends 'url' ? never : K]: T[K];
};

/**
 * Practical fetch options for Deepcrawl SDK
 * Only includes options that actually affect the HTTP transport layer to the worker
 * Most RequestInit options are intentionally excluded as they don't apply to RPC-over-HTTP
 */
export interface DeepcrawlFetchOptions {
  // Additional headers (auth headers are handled automatically)
  headers?: HeadersInit;

  // Cookie handling for dashboard users with session auth
  credentials?: RequestCredentials; // 'include' | 'omit' | 'same-origin'

  // Node.js connection pooling (ignored in other environments)
  agent?: Agent;
}

export type DeepcrawlHeaders =
  | Record<string, string | string[] | undefined>
  | { get(name: string): string | null };

interface DeepcrawlConfigBase {
  baseUrl?: string;
  headers?: DeepcrawlHeaders;
  fetch?: typeof fetch;
  fetchOptions?: DeepcrawlFetchOptions;
}

export type DeepcrawlConfig =
  | (DeepcrawlConfigBase & {
      apiKey: string;
    })
  | (Omit<DeepcrawlConfigBase, 'headers'> & {
      apiKey?: undefined;
      headers: DeepcrawlHeaders;
    });

export interface DeepcrawlClientContext extends ClientRetryPluginContext {}

export type DeepcrawlClient = CRC<
  typeof import('@deepcrawl/contracts').contract
>;

/**
 * Base error class that preserves oRPC structure while providing enhanced developer experience
 */
export abstract class DeepcrawlError<TData = unknown> extends Error {
  readonly code: string;
  readonly status: number;
  readonly data: TData;
  readonly defined: boolean;

  constructor(
    code: string,
    message: string,
    data: TData,
    status = 500,
    defined = false,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.data = data;
    this.defined = defined;
  }

  /**
   * User-friendly error message derived from error data or message
   */
  abstract get userMessage(): string;

  /**
   * Type guards for easy error checking
   */
  static isReadError(error: unknown): error is DeepcrawlReadError {
    return error instanceof DeepcrawlReadError;
  }

  static isLinksError(error: unknown): error is DeepcrawlLinksError {
    return error instanceof DeepcrawlLinksError;
  }

  static isRateLimitError(error: unknown): error is DeepcrawlRateLimitError {
    return error instanceof DeepcrawlRateLimitError;
  }

  static isAuthError(error: unknown): error is DeepcrawlAuthError {
    return error instanceof DeepcrawlAuthError;
  }

  static isValidationError(error: unknown): error is DeepcrawlValidationError {
    return error instanceof DeepcrawlValidationError;
  }

  static isNotFoundError(error: unknown): error is DeepcrawlNotFoundError {
    return error instanceof DeepcrawlNotFoundError;
  }

  static isServerError(error: unknown): error is DeepcrawlServerError {
    return error instanceof DeepcrawlServerError;
  }

  static isNetworkError(error: unknown): error is DeepcrawlNetworkError {
    return error instanceof DeepcrawlNetworkError;
  }

  /**
   * Instance methods for fluent checking
   */
  isRead(): this is DeepcrawlReadError {
    return this instanceof DeepcrawlReadError;
  }

  isLinks(): this is DeepcrawlLinksError {
    return this instanceof DeepcrawlLinksError;
  }

  isRateLimit(): this is DeepcrawlRateLimitError {
    return this instanceof DeepcrawlRateLimitError;
  }

  isAuth(): this is DeepcrawlAuthError {
    return this instanceof DeepcrawlAuthError;
  }

  isValidation(): this is DeepcrawlValidationError {
    return this instanceof DeepcrawlValidationError;
  }

  isNotFound(): this is DeepcrawlNotFoundError {
    return this instanceof DeepcrawlNotFoundError;
  }

  isServer(): this is DeepcrawlServerError {
    return this instanceof DeepcrawlServerError;
  }

  isNetwork(): this is DeepcrawlNetworkError {
    return this instanceof DeepcrawlNetworkError;
  }
}

/**
 * Error for read operation failures with typed access to ReadErrorResponse data
 */
export class DeepcrawlReadError extends DeepcrawlError<ReadErrorResponse> {
  constructor(data: ReadErrorResponse) {
    // Pass data.error as the message for consistency with JavaScript Error patterns
    super('READ_ERROR_RESPONSE', data.error, data, 400, true);
  }

  get userMessage(): string {
    return this.message;
  }

  get targetUrl(): string {
    return this.data.targetUrl;
  }

  get success(): false {
    return this.data.success;
  }

  // Preserve data.error for compatibility
  get error(): string {
    return this.data.error;
  }
}

/**
 * Error for links operation failures with typed access to LinksErrorResponse data
 */
export class DeepcrawlLinksError extends DeepcrawlError<LinksErrorResponse> {
  constructor(data: LinksErrorResponse) {
    // Pass data.error as the message for consistency with JavaScript Error patterns
    super('LINKS_ERROR_RESPONSE', data.error, data, 400, true);
  }

  get userMessage(): string {
    return this.message;
  }

  get targetUrl(): string {
    return this.data.targetUrl;
  }

  get timestamp(): string {
    return this.data.timestamp;
  }

  get tree() {
    return this.data.tree;
  }

  get success(): false {
    return this.data.success;
  }

  // Preserve data.error for compatibility
  get error(): string {
    return this.data.error;
  }
}

/**
 * Error for rate limiting with typed access to retry information
 */
export class DeepcrawlRateLimitError extends DeepcrawlError<{
  operation: string;
  retryAfter: number;
}> {
  constructor(config: {
    message: string;
    data: { operation: string; retryAfter: number };
  }) {
    super('RATE_LIMITED', config.message, config.data, 429, true);
  }

  get userMessage(): string {
    return `Rate limited for ${this.operation}. Please retry after ${this.retryAfter} seconds.`;
  }

  get retryAfter(): number {
    return this.data.retryAfter;
  }

  get operation(): string {
    return this.data.operation;
  }
}

/**
 * Error for authentication failures
 */
export class DeepcrawlAuthError extends DeepcrawlError<unknown> {
  constructor(message: string) {
    super('UNAUTHORIZED', message, {}, 401, false);
  }

  get userMessage(): string {
    return this.message;
  }
}

/**
 * Error for validation failures (bad requests)
 */
export class DeepcrawlValidationError extends DeepcrawlError<unknown> {
  constructor(message: string) {
    super('BAD_REQUEST', message, {}, 400, false);
  }

  get userMessage(): string {
    return this.message;
  }
}

/**
 * Error for not found resources
 */
export class DeepcrawlNotFoundError extends DeepcrawlError<unknown> {
  constructor(message: string) {
    super('NOT_FOUND', message, {}, 404, false);
  }

  get userMessage(): string {
    return this.message;
  }
}

/**
 * Error for server internal errors
 */
export class DeepcrawlServerError extends DeepcrawlError<unknown> {
  constructor(message: string) {
    super('INTERNAL_SERVER_ERROR', message, {}, 500, false);
  }

  get userMessage(): string {
    return this.message;
  }
}

/**
 * Error for network/connectivity issues
 */
export class DeepcrawlNetworkError extends DeepcrawlError<unknown> {
  constructor(message: string, originalError?: unknown) {
    super('NETWORK_ERROR', message, { originalError }, 503, false);
  }

  get userMessage(): string {
    return this.message;
  }
}
