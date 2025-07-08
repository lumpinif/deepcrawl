export interface DeepcrawlConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// Removed RequestOptions - oRPC handles request configuration at client level

export class DeepcrawlError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: unknown,
  ) {
    super(message);
    this.name = 'DeepCrawlError';
  }
}

export class DeepcrawlAuthError extends DeepcrawlError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'DeepCrawlAuthError';
  }
}

export class DeepcrawlNetworkError extends DeepcrawlError {
  constructor(message = 'Network error') {
    super(message);
    this.name = 'DeepCrawlNetworkError';
  }
}
