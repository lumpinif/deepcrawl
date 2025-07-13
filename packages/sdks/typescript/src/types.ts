export interface DeepcrawlConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
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
