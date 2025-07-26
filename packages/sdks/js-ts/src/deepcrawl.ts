import type {
  contract,
  ExtractLinksOutput,
  GetMarkdownOutput,
  LinksPOSTInput,
  ReadUrlOutput,
} from '@deepcrawl/contracts';
import type {
  LinksErrorResponse,
  LinksOptions,
  ReadErrorResponse,
  ReadOptions,
} from '@deepcrawl/types';
import {
  createORPCClient,
  createSafeClient,
  isDefinedError,
  type ORPCError,
} from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { ClientRetryPlugin } from '@orpc/client/plugins';
import type { ContractRouterClient } from '@orpc/contract';
import packageJSON from '../package.json' with { type: 'json' };
import {
  type DeepCrawlClientContext,
  DeepcrawlAbortError,
  DeepcrawlAuthError,
  type DeepcrawlClientOptions,
  type DeepcrawlConfig,
  DeepcrawlLinksError,
  DeepcrawlNetworkError,
  DeepcrawlNotFoundError,
  DeepcrawlRateLimitError,
  DeepcrawlReadError,
  DeepcrawlServerError,
  DeepcrawlValidationError,
} from './types';

/**
 * Type guard to check if error is an ORPCError instance
 */
function isORPCError(error: unknown): error is ORPCError<string, unknown> {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    'status' in error &&
    'message' in error
  );
}

/**
 * Check if an error is an abort error (native AbortError or any error with name 'AbortError')
 */
function isNativeAbortError(error: unknown): boolean {
  if (error instanceof DeepcrawlAbortError) {
    return true;
  }

  // Check for native AbortError or any error with name 'AbortError'
  if (
    error &&
    typeof error === 'object' &&
    'name' in error &&
    error.name === 'AbortError'
  ) {
    return true;
  }

  return false;
}

/**
 * Scalable error registry that maps oRPC error codes to Deepcrawl error classes
 * Adding new error types only requires updating this registry
 */
const ERROR_REGISTRY = {
  // Custom business errors (defined in contracts)
  READ_ERROR_RESPONSE: (
    orpcError: ORPCError<'READ_ERROR_RESPONSE', ReadErrorResponse>,
  ) => new DeepcrawlReadError(orpcError.data),

  LINKS_ERROR_RESPONSE: (
    orpcError: ORPCError<'LINKS_ERROR_RESPONSE', LinksErrorResponse>,
  ) => new DeepcrawlLinksError(orpcError.data),

  // Infrastructure errors
  RATE_LIMITED: (
    orpcError: ORPCError<
      'RATE_LIMITED',
      { operation: string; retryAfter: number }
    >,
  ) =>
    new DeepcrawlRateLimitError({
      message: orpcError.message,
      data: orpcError.data,
    }),
} as const;

/**
 * Enhanced error handler that provides world-class error handling with:
 * 1. Type-safe access to error data
 * 2. Automatic error message extraction
 * 3. Scalable error registry
 * 4. Full oRPC compatibility
 * 5. Improved error distinction using isDefinedError
 */
function handleDeepcrawlError(
  error: unknown,
  operation: 'read' | 'links',
  fallbackMessage: string,
): never {
  // Handle native abort errors first
  if (isNativeAbortError(error)) {
    throw new DeepcrawlAbortError('Request was cancelled');
  }

  // Handle oRPC errors with type-safe registry
  if (isORPCError(error)) {
    // Use isDefinedError to distinguish between defined contract errors vs infrastructure errors
    if (isDefinedError(error)) {
      // Handle contract-defined errors with specific handlers
      if (error.code === 'READ_ERROR_RESPONSE') {
        throw ERROR_REGISTRY.READ_ERROR_RESPONSE(
          error as ORPCError<'READ_ERROR_RESPONSE', ReadErrorResponse>,
        );
      }
      if (error.code === 'LINKS_ERROR_RESPONSE') {
        throw ERROR_REGISTRY.LINKS_ERROR_RESPONSE(
          error as ORPCError<'LINKS_ERROR_RESPONSE', LinksErrorResponse>,
        );
      }
      if (error.code === 'RATE_LIMITED') {
        throw ERROR_REGISTRY.RATE_LIMITED(
          error as ORPCError<
            'RATE_LIMITED',
            { operation: string; retryAfter: number }
          >,
        );
      }
    }

    // Handle infrastructure errors (rate limiting, auth, etc.)
    switch (error.code) {
      case 'UNAUTHORIZED':
        throw new DeepcrawlAuthError(error.message || 'Unauthorized');
      case 'BAD_REQUEST':
        throw new DeepcrawlValidationError(error.message || 'Bad request');
      case 'NOT_FOUND':
        throw new DeepcrawlNotFoundError(error.message || 'Not found');
      case 'INTERNAL_SERVER_ERROR':
        throw new DeepcrawlServerError(
          error.message || 'Internal server error',
        );
    }

    // Handle rate limiting by status code as fallback
    if (error.status === 429) {
      throw new DeepcrawlRateLimitError({
        message: error.message,
        data: {
          operation: operation,
          retryAfter: 60, // Default retry after
        },
      });
    }

    // Default to server error for unknown oRPC errors
    throw new DeepcrawlServerError(
      error.message || `Server error: ${error.code}`,
    );
  }

  // Default to network error for all other cases
  throw new DeepcrawlNetworkError(fallbackMessage, error);
}

/**
 * Extract auth headers from Next.js headers or standard headers object
 */
function extractAuthHeaders(
  headers: DeepcrawlConfig['headers'],
): Record<string, string | string[] | undefined> {
  if (!headers) return {};

  // Check if this is a Next.js headers object (has .get method)
  const isNextJSHeaders = 'get' in headers && typeof headers.get === 'function';

  if (isNextJSHeaders) {
    // Extract only auth-related headers from Next.js headers for security
    const authHeaders: Record<string, string> = {};
    const authHeaderNames = ['cookie', 'authorization'];
    const nextHeaders = headers as { get(name: string): string | null };

    for (const headerName of authHeaderNames) {
      const value = nextHeaders.get(headerName);
      if (value) {
        authHeaders[headerName] = value;
      }
    }

    return authHeaders;
  }

  // Standard headers object - return as-is (user responsibility)
  return headers as Record<string, string | string[] | undefined>;
}

export class DeepcrawlApp {
  public client: ContractRouterClient<typeof contract, DeepCrawlClientContext>;
  private safeClient: ReturnType<
    typeof createSafeClient<
      ContractRouterClient<typeof contract, DeepCrawlClientContext>
    >
  >;
  private config: DeepcrawlConfig;

  constructor(config: DeepcrawlConfig) {
    this.config = {
      baseUrl: config.baseUrl || 'https://api.deepcrawl.dev',
      ...config,
    };

    if (!this.config.apiKey) {
      throw new DeepcrawlAuthError('API key is required');
    }

    // Use custom fetch or globalThis.fetch with proper fallback
    const fetchImpl = this.config.fetch || globalThis.fetch;
    if (!fetchImpl) {
      throw new DeepcrawlServerError(
        'Fetch is not available. Please provide a fetch implementation or use Node.js 18+',
      );
    }

    const link = new RPCLink<DeepCrawlClientContext>({
      url: () => {
        return `${this.config.baseUrl}/rpc`;
      },
      headers: () => {
        const extractedHeaders = extractAuthHeaders(this.config.headers);

        return {
          Authorization: `Bearer ${this.config.apiKey}`,
          'x-api-key': this.config.apiKey,
          'Content-Type': 'application/json',
          'User-Agent': `${packageJSON.name}@${packageJSON.version}`,
          ...extractedHeaders,
        };
      },
      fetch: (request, init) =>
        fetchImpl(request, {
          ...init,
          ...this.config.fetchOptions,
          credentials: this.config.fetchOptions?.credentials || 'include',
        }),
      plugins: [
        new ClientRetryPlugin({
          default: {
            retry: ({ path }) => {
              // Retry read operations up to 2 times
              if (path[0] === 'read') return 2;
              // Retry link operations up to 2 times
              if (path[0] === 'links') return 2;
              return 0;
            },
            retryDelay: ({ attemptIndex }) =>
              Math.min(1000 * Math.pow(2, attemptIndex), 10000), // Exponential backoff
            shouldRetry: ({ error, path, attemptIndex }) => {
              // Never retry on abort errors
              if (isNativeAbortError(error)) {
                return false;
              }

              if (error instanceof Error) {
                const networkErrorPatterns = [
                  'ECONNREFUSED',
                  'ENOTFOUND',
                  'ETIMEDOUT',
                  'ECONNRESET',
                  'ENETUNREACH',
                  'EHOSTUNREACH',
                  'EPIPE',
                  'ECONNABORTED',
                  'Network request failed',
                  'fetch failed',
                  'socket hang up',
                  'request timed out',
                ];
                const errorMessage = error.message.toLowerCase();
                const isNetworkError = networkErrorPatterns.some((pattern) =>
                  errorMessage.includes(pattern.toLowerCase()),
                );
                if (isNetworkError) {
                  return true;
                }
                // Check for specific error types that indicate network issues
                if ('cause' in error && error.cause instanceof Error) {
                  const causeMessage = error.cause.message.toLowerCase();
                  const hasNetworkCause = networkErrorPatterns.some((pattern) =>
                    causeMessage.includes(pattern.toLowerCase()),
                  );
                  if (hasNetworkCause) {
                    return true;
                  }
                }
              }

              return false;
            },
          },
        }),
      ],
    });

    this.client = createORPCClient(link);
    this.safeClient = createSafeClient(this.client);
  }

  /* Read GET */
  /**
   * @param url - The URL to get the markdown for.
   * @param options - Optional configuration including abort signal
   * @returns The markdown.
   */
  async getMarkdown(
    url: string,
    options?: DeepcrawlClientOptions,
  ): Promise<GetMarkdownOutput> {
    const [error, data] = await this.safeClient.read.getMarkdown(
      { url },
      { signal: options?.signal },
    );

    if (error) {
      handleDeepcrawlError(error, 'read', 'Failed to fetch markdown');
    }

    if (data instanceof Blob) {
      return await data.text();
    }

    return data as GetMarkdownOutput;
  }

  /* Read POST */
  /**
   * @param url - The URL to read.
   * @param options - The options to use for the reading.
   * @param requestOptions - Optional configuration including abort signal
   * @returns The read result.
   */
  async readUrl(
    url: string,
    options: Omit<ReadOptions, 'url'> = {},
    requestOptions?: DeepcrawlClientOptions,
  ): Promise<ReadUrlOutput> {
    const readOptions: ReadOptions = {
      url,
      ...options,
    };

    const [error, data] = await this.safeClient.read.readUrl(readOptions, {
      signal: requestOptions?.signal,
    });

    if (error) {
      handleDeepcrawlError(error, 'read', 'Failed to read URL');
    }

    return data as ReadUrlOutput;
  }

  /* Links POST */
  /**
   * @param url - The URL to extract links from.
   * @param options - The options to use for the extraction.
   * @param requestOptions - Optional configuration including abort signal
   * @returns The extracted links.
   */
  async extractLinks(
    url: string,
    options: Omit<LinksOptions, 'url'> = {},
    requestOptions?: DeepcrawlClientOptions,
  ): Promise<ExtractLinksOutput> {
    const linksOptions: LinksPOSTInput = {
      url,
      ...options,
    };

    const [error, data] = await this.safeClient.links.extractLinks(
      linksOptions,
      { signal: requestOptions?.signal },
    );

    if (error) {
      handleDeepcrawlError(error, 'links', 'Failed to extract links');
    }

    return data as ExtractLinksOutput;
  }
}

export default DeepcrawlApp;
