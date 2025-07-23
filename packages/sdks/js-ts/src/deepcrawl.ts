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
  isDefinedError,
  type ORPCError,
  safe,
} from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import {
  ClientRetryPlugin,
  type ClientRetryPluginContext,
} from '@orpc/client/plugins';
import type { ContractRouterClient } from '@orpc/contract';
import packageJSON from '../package.json' with { type: 'json' };
import {
  DeepcrawlAuthError,
  type DeepcrawlConfig,
  DeepcrawlError,
  DeepcrawlLinksError,
  DeepcrawlNetworkError,
  DeepcrawlRateLimitError,
  DeepcrawlReadError,
} from './types';

interface DeepCrawlClientContext extends ClientRetryPluginContext {}

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
 * Unified error handler that maps oRPC errors to appropriate SDK errors
 * This provides a consistent error handling pattern across all methods
 */
function handleORPCError(
  error: unknown,
  operation: 'read' | 'links',
  fallbackMessage: string,
): never {
  // Check if error is an ORPCError instance
  if (isORPCError(error)) {
    // Handle contract-defined errors (these have defined: true)
    if (isDefinedError(error)) {
      switch (error.code) {
        case 'RATE_LIMITED': {
          const data = error.data as { operation: string; retryAfter: number };
          throw new DeepcrawlRateLimitError({
            message: error.message,
            data,
          });
        }
        case 'READ_ERROR_RESPONSE': {
          const data = error.data as ReadErrorResponse;
          throw new DeepcrawlReadError(data);
        }
        case 'LINKS_ERROR_RESPONSE': {
          const data = error.data as LinksErrorResponse;
          throw new DeepcrawlLinksError(data);
        }
      }
    }

    // Handle generic oRPC errors (not defined in contracts)
    switch (error.code) {
      case 'UNAUTHORIZED':
        throw new DeepcrawlAuthError(error.message || 'Unauthorized');

      case 'BAD_REQUEST':
      case 'NOT_FOUND':
        throw new DeepcrawlError(
          error.message || fallbackMessage,
          error,
          error.status,
        );

      default:
        // Check for rate limiting by status code as fallback
        if (error.status === 429) {
          throw new DeepcrawlRateLimitError({
            message: error.message,
            data: {
              operation: operation,
              retryAfter: 60, // Default retry after
            },
          });
        }

        throw new DeepcrawlError(
          error.message || 'Server error',
          error,
          error.status,
        );
    }
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
      throw new DeepcrawlError(
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
          credentials: this.config.fetchOptions?.credentials || 'include', // Keep this to include cookies for cross-origin requests
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
            shouldRetry: ({ error }) => {
              // Only retry on network errors
              if (error instanceof Error) {
                // Common network error patterns
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
                if (isNetworkError) return true;
                // Check for specific error types that indicate network issues
                if ('cause' in error && error.cause instanceof Error) {
                  const causeMessage = error.cause.message.toLowerCase();
                  return networkErrorPatterns.some((pattern) =>
                    causeMessage.includes(pattern.toLowerCase()),
                  );
                }
              }

              return false;
            },
          },
        }),
      ],
    });

    this.client = createORPCClient(link);
  }

  /* Read GET */
  /**
   * @param url - The URL to get the markdown for.
   * @returns The markdown.
   */
  async getMarkdown(url: string): Promise<GetMarkdownOutput> {
    const [error, data] = await safe(this.client.read.getMarkdown({ url }));

    if (error) {
      handleORPCError(error, 'read', 'Failed to fetch markdown');
    }

    return data as GetMarkdownOutput;
  }

  /* Read POST */
  /**
   * @param url - The URL to read.
   * @param options - The options to use for the reading.
   * @returns The read result.
   */
  async readUrl(
    url: string,
    options: Omit<ReadOptions, 'url'> = {},
  ): Promise<ReadUrlOutput> {
    const readOptions: ReadOptions = {
      url,
      ...options,
    };

    const [error, data] = await safe(this.client.read.readUrl(readOptions));

    if (error) {
      handleORPCError(error, 'read', 'Failed to read URL');
    }

    return data as ReadUrlOutput;
  }

  /* Links GET */
  /**
   * Use extractLinks instead.
   * @param url - The URL to get links from.
   * @returns The links.
   */
  // async getLinks(url: string): Promise<GetLinksOutput> {
  //   const [error, data] = await safe(this.client.links.getLinks({ url }));

  //   if (isDefinedError(error)) {
  //     // Throw specific links error with detailed information
  //     throw new DeepcrawlLinksError(error.data);
  //   }
  //   // @ts-ignore TODO: FIX ERROR TYPE
  //   if (!isDefinedError(error) && error?.code === 'UNAUTHORIZED') {
  //     throw new DeepcrawlAuthError('Unauthorized');
  //   }

  //   if (error) {
  //     throw new DeepcrawlNetworkError('Failed to get links', error);
  //   }

  //   return data;
  // }

  /* Links POST */
  /**
   * @param url - The URL to extract links from.
   * @param options - The options to use for the extraction.
   * @returns The extracted links.
   */
  async extractLinks(
    url: string,
    options: Omit<LinksOptions, 'url'> = {},
  ): Promise<ExtractLinksOutput> {
    const linksOptions: LinksPOSTInput = {
      url,
      ...options,
    };

    const [error, data] = await safe(
      this.client.links.extractLinks(linksOptions),
    );

    if (error) {
      handleORPCError(error, 'links', 'Failed to extract links');
    }

    return data as ExtractLinksOutput;
  }
}

export default DeepcrawlApp;
