interface StandardHeaders {
  [key: string]: string | string[] | undefined;
}

// Type for Next.js ReadonlyHeaders (extends standard Headers)
type ReadonlyHeaders = Headers & {
  /** @deprecated Method unavailable on `ReadonlyHeaders`. Read more: https://nextjs.org/docs/app/api-reference/functions/headers */
  // biome-ignore lint/suspicious/noExplicitAny: Matching Next.js ReadonlyHeaders type definition
  append(...args: any[]): void;
  /** @deprecated Method unavailable on `ReadonlyHeaders`. Read more: https://nextjs.org/docs/app/api-reference/functions/headers */
  // biome-ignore lint/suspicious/noExplicitAny: Matching Next.js ReadonlyHeaders type definition
  set(...args: any[]): void;
  /** @deprecated Method unavailable on `ReadonlyHeaders`. Read more: https://nextjs.org/docs/app/api-reference/functions/headers */
  // biome-ignore lint/suspicious/noExplicitAny: Matching Next.js ReadonlyHeaders type definition
  delete(...args: any[]): void;
};

export interface DeepcrawlConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  headers?: StandardHeaders | ReadonlyHeaders; // Now accepts Next.js ReadonlyHeaders directly
  fetch?: typeof fetch; // Allow custom fetch implementation
  fetchOptions?: RequestInit;
}

export class DeepcrawlError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
    public status?: number,
  ) {
    super(message);
    this.name = 'DeepcrawlError';
    this.status = status ?? 500;
  }
}

export class DeepcrawlAuthError extends DeepcrawlError {
  constructor(message: string) {
    super(message);
    this.name = 'DeepcrawlAuthError';
    this.status = 401;
  }
}

export class DeepcrawlNetworkError extends DeepcrawlError {
  constructor(message: string, cause?: unknown, status?: number) {
    super(message, cause);
    this.name = 'DeepcrawlNetworkError';
    this.status = status ?? 503;
  }
}

/**
 * Error thrown when reading a URL fails
 * Contains detailed information from the API response
 */
export class DeepcrawlReadError extends DeepcrawlError {
  public readonly success = false;
  public readonly targetUrl: string;

  constructor(errorResponse: {
    success: false;
    targetUrl: string;
    error: string;
  }) {
    super(errorResponse.error);
    this.name = 'DeepcrawlReadError';
    this.targetUrl = errorResponse.targetUrl;
    this.status = 400;
  }
}

/**
 * Error thrown when rate limit is exceeded
 * Contains retry information from the API response
 */
export class DeepcrawlRateLimitError extends DeepcrawlError {
  public readonly operation: string;
  public readonly retryAfter: number;

  constructor(errorResponse: {
    message?: string;
    data: {
      operation: string;
      retryAfter: number;
    };
  }) {
    const message =
      errorResponse.message ||
      `Rate limit exceeded for operation: ${errorResponse.data.operation}. Retry after ${errorResponse.data.retryAfter} seconds.`;
    super(message);
    this.name = 'DeepcrawlRateLimitError';
    this.operation = errorResponse.data.operation;
    this.retryAfter = errorResponse.data.retryAfter;
    this.status = 429;
  }
}

/**
 * Error thrown when extracting links fails
 * Contains detailed information from the API response
 */
export class DeepcrawlLinksError extends DeepcrawlError {
  public readonly success = false;
  public readonly targetUrl: string;
  public readonly timestamp?: string;
  public readonly tree?: unknown; // Partial site map if available

  constructor(errorResponse: {
    success: false;
    targetUrl: string;
    error: string;
    timestamp?: string;
    tree?: unknown;
  }) {
    super(errorResponse.error);
    this.name = 'DeepcrawlLinksError';
    this.targetUrl = errorResponse.targetUrl;
    this.timestamp = errorResponse.timestamp;
    this.tree = errorResponse.tree;
    this.status = 400;
  }
}
