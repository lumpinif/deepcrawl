export interface DeepCrawlConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// Removed RequestOptions - oRPC handles request configuration at client level

export class DeepCrawlError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: unknown,
  ) {
    super(message);
    this.name = 'DeepCrawlError';
  }
}

export class DeepCrawlAuthError extends DeepCrawlError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'DeepCrawlAuthError';
  }
}

export class DeepCrawlNetworkError extends DeepCrawlError {
  constructor(message = 'Network error') {
    super(message);
    this.name = 'DeepCrawlNetworkError';
  }
}
