import type { Agent, AgentOptions } from 'node:https';
import type {
  contract,
  ExportResponseOptions,
  ExportResponseOutput,
  ExtractLinksOptions,
  ExtractLinksResponse,
  GetManyLogsOptions,
  GetManyLogsResponse,
  GetMarkdownOptions,
  GetMarkdownResponse,
  GetOneLogOptions,
  GetOneLogResponse,
  ReadUrlOptions,
  ReadUrlResponse,
} from '@deepcrawl/contracts';
import type { LinksErrorResponse, ReadErrorResponse } from '@deepcrawl/types';
import {
  LinksOptions,
  LinksSuccessResponse,
  ReadOptions,
  ReadStringResponse,
  ReadSuccessResponse,
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
import * as https from 'https';
import packageJSON from '../package.json';
import {
  DeepcrawlAuthError,
  type DeepcrawlClientContext,
  type DeepcrawlConfig,
  DeepcrawlLinksError,
  DeepcrawlNetworkError,
  DeepcrawlNotFoundError,
  DeepcrawlRateLimitError,
  DeepcrawlReadError,
  DeepcrawlServerError,
  DeepcrawlValidationError,
  type OptionsWithoutUrl,
} from './types';

const DEFAULT_API_BASE_URL = 'https://api.deepcrawl.dev';

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
  if (!headers) {
    return {};
  }

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

function ensureHttpsBaseUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return DEFAULT_API_BASE_URL;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

const HTTP_AGENT_OPTIONS = {
  keepAlive: true,
  maxSockets: 10,
  maxFreeSockets: 5,
  timeout: 60000,
  keepAliveMsecs: 30000,
} satisfies AgentOptions;

export class DeepcrawlApp {
  public client: ContractRouterClient<typeof contract, DeepcrawlClientContext>;
  private safeClient: ReturnType<
    typeof createSafeClient<
      ContractRouterClient<typeof contract, DeepcrawlClientContext>
    >
  >;
  private config: DeepcrawlConfig;
  private nodeEnv: 'nodeJs' | 'cf-worker' | 'browser' = 'nodeJs';
  private httpsAgent?: Agent; // Node.js https.Agent
  private authMode: 'apiKey' | 'session' = 'apiKey';
  private apiKey?: string;

  /**
   * Lazy-load and cache the HTTPS agent for Node.js environments
   */
  private async getHttpsAgent(): Promise<Agent | undefined> {
    if (this.nodeEnv !== 'nodeJs') {
      return;
    }

    if (!this.httpsAgent) {
      try {
        this.httpsAgent = new https.Agent({
          ...HTTP_AGENT_OPTIONS,
        });
      } catch (error) {
        console.warn('Failed to initialize HTTPS agent:', error);
        return;
      }
    }

    return this.httpsAgent;
  }

  constructor(config: DeepcrawlConfig) {
    const resolvedBaseUrl =
      config.baseUrl && config.baseUrl.trim().length > 0
        ? ensureHttpsBaseUrl(config.baseUrl)
        : DEFAULT_API_BASE_URL;

    this.config = {
      ...config,
      baseUrl: resolvedBaseUrl,
    };

    // Detect runtime environment with better browser detection
    const isBrowser =
      (typeof window !== 'undefined' &&
        typeof window.document !== 'undefined') ||
      typeof document !== 'undefined';

    this.nodeEnv =
      typeof process !== 'undefined' && !!process.versions?.node && !isBrowser
        ? 'nodeJs'
        : typeof globalThis.caches !== 'undefined' &&
            typeof (globalThis as { EdgeRuntime?: unknown }).EdgeRuntime ===
              'undefined' &&
            !isBrowser
          ? 'cf-worker'
          : isBrowser
            ? 'browser'
            : 'nodeJs';

    if (this.nodeEnv === 'browser') {
      throw new DeepcrawlServerError(
        'DeepcrawlApp is server-only. Instantiate the client in Node.js or Cloudflare Worker runtimes.',
      );
    }

    const providedApiKey =
      typeof this.config.apiKey === 'string'
        ? this.config.apiKey.trim()
        : undefined;

    const hasApiKey = Boolean(providedApiKey);
    const hasHeaders = Boolean(this.config.headers);

    if (!(hasApiKey || hasHeaders)) {
      throw new DeepcrawlAuthError(
        '[DEEPCRAWL_AUTH] Please provide a valid API key. Get one from: deepcrawl.dev/app/api-keys.',
      );
    }

    if (hasApiKey) {
      this.apiKey = providedApiKey;
      this.authMode = 'apiKey';
    } else {
      this.authMode = 'session';
    }

    // Use custom fetch or globalThis.fetch with proper fallback
    const fetchImpl = this.config.fetch || globalThis.fetch;
    if (!fetchImpl) {
      throw new DeepcrawlServerError(
        'Fetch is not available. Please provide a fetch implementation or use Node.js 18+',
      );
    }

    const link = new RPCLink<DeepcrawlClientContext>({
      url: () => {
        return `${this.config.baseUrl}/rpc`;
      },
      headers: () => {
        const extractedHeaders = extractAuthHeaders(this.config.headers);
        const apiKeyHeaders =
          this.authMode === 'apiKey' && this.apiKey
            ? {
                Authorization: `Bearer ${this.apiKey}`,
                'x-api-key': this.apiKey,
              }
            : {};

        return {
          ...apiKeyHeaders,
          'Content-Type': 'application/json',
          'User-Agent': `${packageJSON.name}@${packageJSON.version}`,
          ...(this.nodeEnv === 'nodeJs' ? { Connection: 'keep-alive' } : {}),
          ...extractedHeaders,
        };
      },
      /**
       * @note
       * SDK clients CANNOT pass custom AbortSignals over HTTP (impossible to serialize)
       * Our timeout protection works regardless of client behavior
       */
      fetch: async (request, init) =>
        fetchImpl(request, {
          ...init,
          ...this.config.fetchOptions,
          credentials: this.config.fetchOptions?.credentials || 'include',
          // @ts-expect-error - Node.js specific option
          agent:
            this.config.fetchOptions?.agent || (await this.getHttpsAgent()),
        }),
      plugins: [
        new ClientRetryPlugin({
          default: {
            retry: ({ path }) => {
              // Retry read operations up to 2 times
              if (path[0] === 'read') {
                return 2;
              }
              // Retry link operations up to 2 times
              if (path[0] === 'links') {
                return 2;
              }
              return 0;
            },
            retryDelay: ({ attemptIndex }) =>
              Math.min(1000 * Math.pow(2, attemptIndex), 10000), // Exponential backoff
            shouldRetry: ({ error, path, attemptIndex }) => {
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
   * ---
   *
   * @method async `getMarkdown()` - Get clean markdown content from any webpage.
   * @returns {Promise<string>} Promise<{@link ReadStringResponse string|GetMarkdownResponse|ReadStringResponse}> - The markdown content as a string.
   * @params {@link getMarkdown} supports two convenient calling patterns:
   * 1. getMarkdown({@link ReadOptions.url url: string}, {{@link OptionsWithoutUrl<GetMarkdownOptions> ...GetMarkdownOptionsWithoutUrl}}) - Pass URL as first parameter, options without url as the second parameter
   * 2. getMarkdown({@link ReadGETInputSchema options: GetMarkdownOptions}) - Pass the complete options object as the only parameter which contains the URL
   *
   * @example
   * ```typescript
   * import { DeepcrawlApp, GetMarkdownResponse } from 'deepcrawl';
   *
   * const dc = new DeepcrawlApp({ apiKey: 'your-api-key' });
   *
   * // Simple usage
   * const markdown: GetMarkdownResponse = await dc.getMarkdown('https://example.com');
   *
   * // With custom options
   * const result: GetMarkdownResponse = await dc.getMarkdown('https://example.com', {
   *   rawHtml: true,
   *   metadata: false
   * });
   * ```
   *
   * @throws `DeepcrawlAuthError` Invalid or missing API key - {@link DeepcrawlAuthError}
   * @throws `DeepcrawlValidationError` Invalid URL format - {@link DeepcrawlValidationError}
   * @throws `DeepcrawlReadError` Cannot read or process the page - {@link DeepcrawlReadError}
   * @throws `DeepcrawlNetworkError` Network request failed - {@link DeepcrawlNetworkError}
   *
   */
  async getMarkdown(
    url: string,
    options?: OptionsWithoutUrl<GetMarkdownOptions>,
  ): Promise<GetMarkdownResponse>;

  /**
   * ---
   *
   * @method async `getMarkdown()` - Get clean markdown content from any webpage.
   * @returns {Promise<string>} Promise<{@link ReadStringResponse string|GetMarkdownResponse|ReadStringResponse}> - The markdown content as a string.
   * @param options getMarkdown({@link GetMarkdownOptions options: GetMarkdownOptions}) - Pass the complete options object as the only parameter which contains the URL (required)
   *
   * @example
   * ```typescript
   * import { DeepcrawlApp, GetMarkdownOptions, GetMarkdownResponse } from 'deepcrawl';
   *
   * const dc = new DeepcrawlApp({ apiKey: 'your-api-key' });
   *
   * // With complete options
   * const markdown: GetMarkdownResponse = await dc.getMarkdown({
   *   url: 'https://example.com',
   *   rawHtml: true,
   *   metadata: false
   * } as GetMarkdownOptions);
   * ```
   *
   * @throws `DeepcrawlAuthError` Invalid or missing API key - {@link DeepcrawlAuthError}
   * @throws `DeepcrawlValidationError` Invalid URL format - {@link DeepcrawlValidationError}
   * @throws `DeepcrawlReadError` Cannot read or process the page - {@link DeepcrawlReadError}
   * @throws `DeepcrawlNetworkError` Network request failed - {@link DeepcrawlNetworkError}
   *
   */
  async getMarkdown(options: GetMarkdownOptions): Promise<GetMarkdownResponse>;
  async getMarkdown(
    urlOrOptions: string | GetMarkdownOptions,
    options?: OptionsWithoutUrl<GetMarkdownOptions>,
  ): Promise<GetMarkdownResponse> {
    if (typeof urlOrOptions === 'string') {
      // Pattern 1: getMarkdown(url, options)
      const getMarkdownOptions: GetMarkdownOptions = {
        url: urlOrOptions,
        ...options,
      };

      const [error, data] =
        await this.safeClient.read.getMarkdown(getMarkdownOptions);

      if (error) {
        handleDeepcrawlError(error, 'read', 'Failed to fetch markdown');
      }

      if (data instanceof Blob) {
        return await data.text();
      }

      return data as GetMarkdownResponse;
    } else {
      // Pattern 2: getMarkdown(options)
      const [error, data] =
        await this.safeClient.read.getMarkdown(urlOrOptions);

      if (error) {
        handleDeepcrawlError(error, 'read', 'Failed to fetch markdown');
      }

      if (data instanceof Blob) {
        return await data.text();
      }

      return data as GetMarkdownResponse;
    }
  }

  /* Read POST */
  /**
   * ---
   *
   * @method async `readUrl()` - Read and extract structured content from any webpage.
   * @returns {Promise<ReadUrlResponse>} Promise<{@link ReadSuccessResponse ReadUrlResponse|ReadSuccessResponse}> - Structured content with text, metadata, and more.
   * @params {@link readUrl} supports two convenient calling patterns:
   * 1. readUrl({@link ReadOptions.url url: string}, {{@link OptionsWithoutUrl<ReadUrlOptions> ...ReadUrlOptionsWithoutUrl}}) - Pass URL as first parameter, options without url as the second parameter
   * 2. readUrl({@link ReadOptions options: ReadUrlOptions}) - Pass the complete options object as the only parameter which contains the URL
   *
   * @example
   * ```typescript
   * import { DeepcrawlApp, ReadUrlResponse } from 'deepcrawl';
   *
   * const dc = new DeepcrawlApp({ apiKey: 'your-api-key' });
   *
   * // Simple usage
   * const content: ReadUrlResponse = await dc.readUrl('https://example.com');
   *
   * // With custom options
   * const result: ReadUrlResponse = await dc.readUrl('https://example.com', {
   *   rawHtml: true,
   *   cleanedHtml: true
   * });
   * ```
   *
   * @throws `DeepcrawlAuthError` Invalid or missing API key - {@link DeepcrawlAuthError}
   * @throws `DeepcrawlValidationError` Invalid URL format - {@link DeepcrawlValidationError}
   * @throws `DeepcrawlReadError` Cannot read or process the page - {@link DeepcrawlReadError}
   * @throws `DeepcrawlNetworkError` Network request failed - {@link DeepcrawlNetworkError}
   *
   */
  async readUrl(
    url: string,
    options?: OptionsWithoutUrl<ReadUrlOptions>,
  ): Promise<ReadUrlResponse>;
  /**
   * ---
   *
   * @method async `readUrl()` - Read and extract structured content from any webpage.
   * @returns {Promise<ReadUrlResponse>} Promise<{@link ReadSuccessResponse ReadUrlResponse|ReadSuccessResponse}> - Structured content with text, metadata, and more.
   * @param options readUrl({@link ReadOptions options: ReadUrlOptions}) - Pass the complete options object as the only parameter which contains the URL (required)
   *
   * @example
   * ```typescript
   * import { DeepcrawlApp, ReadUrlOptions, ReadUrlResponse } from 'deepcrawl';
   *
   * const dc = new DeepcrawlApp({ apiKey: 'your-api-key' });
   *
   * // With complete options
   * const content: ReadUrlResponse = await dc.readUrl({
   *   url: 'https://example.com',
   *   rawHtml: true,
   *   metadata: false
   * } as ReadUrlOptions);
   * ```
   *
   * @throws `DeepcrawlAuthError` Invalid or missing API key - {@link DeepcrawlAuthError}
   * @throws `DeepcrawlValidationError` Invalid URL format - {@link DeepcrawlValidationError}
   * @throws `DeepcrawlReadError` Cannot read or process the page - {@link DeepcrawlReadError}
   * @throws `DeepcrawlNetworkError` Network request failed - {@link DeepcrawlNetworkError}
   *
   */
  async readUrl(options: ReadUrlOptions): Promise<ReadUrlResponse>;
  async readUrl(
    urlOrOptions: string | ReadUrlOptions,
    options: OptionsWithoutUrl<ReadUrlOptions> = {},
  ): Promise<ReadUrlResponse> {
    if (typeof urlOrOptions === 'string') {
      // Pattern 1: readUrl(url, options)
      const readOptions: ReadUrlOptions = {
        url: urlOrOptions,
        ...options,
      };

      const [error, data] = await this.safeClient.read.readUrl(readOptions);

      if (error) {
        handleDeepcrawlError(error, 'read', 'Failed to read URL');
      }

      return data as ReadUrlResponse;
    } else {
      // Pattern 2: readUrl(options)
      const [error, data] = await this.safeClient.read.readUrl(urlOrOptions);

      if (error) {
        handleDeepcrawlError(error, 'read', 'Failed to read URL');
      }

      return data as ReadUrlResponse;
    }
  }

  /* Links POST */
  /**
   * ---
   *
   * @method async `extractLinks()` - Extract and discover all links from any webpage with smart filtering.
   * @returns {Promise<ExtractLinksResponse>} Promise<{@link LinksSuccessResponse ExtractLinksResponse|LinksSuccessResponse}> - Array of discovered links with metadata and site tree.
   * @params {@link extractLinks} supports two convenient calling patterns:
   * 1. extractLinks({@link LinksOptions.url url: string}, {{@link OptionsWithoutUrl<ExtractLinksOptions> ...ExtractLinksOptionsWithoutUrl}}) - Pass URL as first parameter, options without url as the second parameter
   * 2. extractLinks({@link LinksOptions options: ExtractLinksOptions}) - Pass the complete options object as the only parameter which contains the URL
   *
   * @example
   * ```typescript
   * import { DeepcrawlApp, ExtractLinksResponse } from 'deepcrawl';
   *
   * const dc = new DeepcrawlApp({ apiKey: 'your-api-key' });
   *
   * // Simple usage
   * const links: ExtractLinksResponse = await dc.extractLinks('https://example.com');
   *
   * // With custom options
   * const result: ExtractLinksResponse = await dc.extractLinks('https://example.com', {
   *   tree: true,
   *   linksOrder: 'alphabetical'
   * });
   * ```
   *
   * @throws `DeepcrawlAuthError` Invalid or missing API key - {@link DeepcrawlAuthError}
   * @throws `DeepcrawlValidationError` Invalid URL format - {@link DeepcrawlValidationError}
   * @throws `DeepcrawlLinksError` Cannot extract links or process the page - {@link DeepcrawlLinksError}
   * @throws `DeepcrawlNetworkError` Network request failed - {@link DeepcrawlNetworkError}
   *
   */
  async extractLinks(
    url: string,
    options?: OptionsWithoutUrl<ExtractLinksOptions>,
  ): Promise<ExtractLinksResponse>;
  /**
   * ---
   *
   * @method async `extractLinks()` - Extract and discover all links from any webpage with smart filtering.
   * @returns {Promise<ExtractLinksResponse>} Promise<{@link LinksSuccessResponse ExtractLinksResponse|LinksSuccessResponse}> - Array of discovered links with metadata and site tree.
   * @param options extractLinks({@link LinksOptions options: ExtractLinksOptions}) - Pass the complete options object as the only parameter which contains the URL (required)
   *
   * @example
   * ```typescript
   * import { DeepcrawlApp, ExtractLinksOptions, ExtractLinksResponse } from 'deepcrawl';
   *
   * const dc = new DeepcrawlApp({ apiKey: 'your-api-key' });
   *
   * // With complete options
   * const links: ExtractLinksResponse = await dc.extractLinks({
   *   url: 'https://example.com',
   *   tree: true,
   *   linksOrder: 'alphabetical'
   * } as ExtractLinksOptions);
   * ```
   *
   * @throws `DeepcrawlAuthError` Invalid or missing API key - {@link DeepcrawlAuthError}
   * @throws `DeepcrawlValidationError` Invalid URL format - {@link DeepcrawlValidationError}
   * @throws `DeepcrawlLinksError` Cannot extract links or process the page - {@link DeepcrawlLinksError}
   * @throws `DeepcrawlNetworkError` Network request failed - {@link DeepcrawlNetworkError}
   *
   */
  async extractLinks(
    options: ExtractLinksOptions,
  ): Promise<ExtractLinksResponse>;
  async extractLinks(
    urlOrOptions: string | ExtractLinksOptions,
    options: OptionsWithoutUrl<ExtractLinksOptions> = {},
  ): Promise<ExtractLinksResponse> {
    if (typeof urlOrOptions === 'string') {
      // Pattern 1: extractLinks(url, options)
      const linksOptions: ExtractLinksOptions = {
        url: urlOrOptions,
        ...options,
      };

      const [error, data] =
        await this.safeClient.links.extractLinks(linksOptions);

      if (error) {
        handleDeepcrawlError(error, 'links', 'Failed to extract links');
      }

      return data as ExtractLinksResponse;
    } else {
      // Pattern 2: extractLinks(options)
      const [error, data] =
        await this.safeClient.links.extractLinks(urlOrOptions);

      if (error) {
        handleDeepcrawlError(error, 'links', 'Failed to extract links');
      }

      return data as ExtractLinksResponse;
    }
  }

  /* Logs POST */
  /**
   * ---
   *
   * @method async `getManyLogs()` - Retrieve activity logs with reconstructed responses and full type safety through discriminated unions.
   * @returns {Promise<GetManyLogsResponse>} Promise<{@link GetManyLogsResponse}> - Array of {@link ActivityLogEntry} with discriminated union type safety.
   * @param options getManyLogsOptions ({@link GetManyLogsOptions options?: GetManyLogOptions}) - Optional filters for logs retrieval
   *
   * Each log entry uses a discriminated union based on the `path` field, enabling precise type narrowing:
   *
   * - **`read-getMarkdown`**: Returns markdown content as a string
   *   - `requestOptions`: {@link GetMarkdownOptions}
   *   - `response`: `string` (markdown content)
   *
   * - **`read-readUrl`**: Returns structured page content with metadata
   *   - `requestOptions`: {@link ReadOptions}
   *   - `response`: {@link ReadSuccessResponse} | {@link ReadErrorResponse}
   *
   * - **`links-getLinks`**: Extracts links from a page (GET request)
   *   - `requestOptions`: {@link LinksOptions}
   *   - `response`: {@link LinksSuccessResponse} | {@link LinksErrorResponse}
   *
   * - **`links-extractLinks`**: Extracts links from a page (POST request)
   *   - `requestOptions`: {@link LinksOptions}
   *   - `response`: {@link LinksSuccessResponse} | {@link LinksErrorResponse}
   *
   * @example Basic usage
   * ```typescript
   * import { DeepcrawlApp, GetManyLogsResponse } from 'deepcrawl';
   *
   * const dc = new DeepcrawlApp({ apiKey: 'your-api-key' });
   *
   * // Get recent logs (default: 20)
   * const logs: GetManyLogsResponse = await dc.getManyLogs();
   *
   * // With filters
   * const filteredLogs: GetManyLogsResponse = await dc.getManyLogs({
   *   limit: 50,
   *   offset: 0,
   *   path: 'read-getMarkdown',
   *   success: true,
   *   startDate: '2025-01-01T00:00:00Z',
   *   endDate: '2025-12-31T23:59:59Z'
   * });
   * ```
   *
   * @example Type narrowing with discriminated union
   * ```typescript
   * const { logs } = await dc.getManyLogs();
   *
   * for (const log of logs) {
   *   // TypeScript automatically narrows types based on path
   *   if (log.path === 'read-getMarkdown') {
   *     // log.response is typed as string
   *     // log.requestOptions is typed as GetMarkdownOptions
   *     console.log('Markdown URL:', log.requestOptions.url);
   *     console.log('Content length:', log.response.length);
   *   } else if (log.path === 'read-readUrl') {
   *     // log.response is typed as ReadSuccessResponse | ReadErrorResponse
   *     // log.requestOptions is typed as ReadOptions
   *     if ('success' in log.response && log.response.success) {
   *       console.log('Page title:', log.response.title);
   *       console.log('Markdown enabled:', log.requestOptions.markdown);
   *     }
   *   } else if (log.path === 'links-getLinks' || log.path === 'links-extractLinks') {
   *     // log.response is typed as LinksSuccessResponse | LinksErrorResponse
   *     // log.requestOptions is typed as LinksOptions
   *     if ('success' in log.response && log.response.success) {
   *       console.log('Total links:', log.response.totalLinks);
   *       console.log('Tree enabled:', log.requestOptions.tree);
   *     }
   *   }
   * }
   * ```
   *
   * @throws `DeepcrawlAuthError` Invalid or missing API key - {@link DeepcrawlAuthError}
   * @throws `DeepcrawlValidationError` Invalid filter parameters - {@link DeepcrawlValidationError}
   * @throws `DeepcrawlNetworkError` Network request failed - {@link DeepcrawlNetworkError}
   * @throws `DeepcrawlRateLimitError` Rate limit exceeded - {@link DeepcrawlRateLimitError}
   *
   */
  async getManyLogs(
    options?: GetManyLogsOptions,
  ): Promise<GetManyLogsResponse> {
    const [error, data] = await this.safeClient.logs.getMany(options || {});

    if (error) {
      handleDeepcrawlError(error, 'read', 'Failed to fetch logs');
    }

    return data as GetManyLogsResponse;
  }

  /**
   * ---
   *
   * @method async `getOneLog()` - Retrieve a single activity log entry by ID with full type safety through discriminated unions.
   * @returns {Promise<GetOneLogResponse>} Promise<{@link GetOneLogResponse}> - Single {@link ActivityLogEntry} with discriminated union type safety.
   * @param options getOneLogOptions ({@link GetOneLogOptions options: GetOneLogOptions}) - Log ID (Request ID) to retrieve
   *
   * The returned log entry uses a discriminated union based on the `path` field, enabling precise type narrowing:
   *
   * - **`read-getMarkdown`**: Returns markdown content as a string
   *   - `requestOptions`: {@link GetMarkdownOptions}
   *   - `response`: `string` (markdown content)
   *
   * - **`read-readUrl`**: Returns structured page content with metadata
   *   - `requestOptions`: {@link ReadOptions}
   *   - `response`: {@link ReadSuccessResponse} | {@link ReadErrorResponse}
   *
   * - **`links-getLinks`**: Extracts links from a page (GET request)
   *   - `requestOptions`: {@link LinksOptions}
   *   - `response`: {@link LinksSuccessResponse} | {@link LinksErrorResponse}
   *
   * - **`links-extractLinks`**: Extracts links from a page (POST request)
   *   - `requestOptions`: {@link LinksOptions}
   *   - `response`: {@link LinksSuccessResponse} | {@link LinksErrorResponse}
   *
   * @example Basic usage
   * ```typescript
   * import { DeepcrawlApp, GetOneLogResponse } from 'deepcrawl';
   *
   * const dc = new DeepcrawlApp({ apiKey: 'your-api-key' });
   *
   * // Get a specific log by ID
   * const log: GetOneLogResponse = await dc.getOneLog({ id: 'log-123' });
   * ```
   *
   * @example Type narrowing with discriminated union
   * ```typescript
   * const log = await dc.getOneLog({ id: 'log-123' });
   *
   * // TypeScript automatically narrows types based on path
   * if (log.path === 'read-getMarkdown') {
   *   // log.response is typed as string
   *   // log.requestOptions is typed as GetMarkdownOptions
   *   console.log('Markdown URL:', log.requestOptions.url);
   *   console.log('Content length:', log.response.length);
   * } else if (log.path === 'read-readUrl') {
   *   // log.response is typed as ReadSuccessResponse | ReadErrorResponse
   *   // log.requestOptions is typed as ReadOptions
   *   if ('success' in log.response && log.response.success) {
   *     console.log('Page title:', log.response.title);
   *     console.log('Markdown enabled:', log.requestOptions.markdown);
   *   }
   * } else if (log.path === 'links-getLinks' || log.path === 'links-extractLinks') {
   *   // log.response is typed as LinksSuccessResponse | LinksErrorResponse
   *   // log.requestOptions is typed as LinksOptions
   *   if ('success' in log.response && log.response.success) {
   *     console.log('Total links:', log.response.totalLinks);
   *     console.log('Tree enabled:', log.requestOptions.tree);
   *   }
   * }
   * ```
   *
   * @throws `DeepcrawlAuthError` Invalid or missing API key - {@link DeepcrawlAuthError}
   * @throws `DeepcrawlNotFoundError` Log not found - {@link DeepcrawlNotFoundError}
   * @throws `DeepcrawlValidationError` Invalid log ID - {@link DeepcrawlValidationError}
   * @throws `DeepcrawlNetworkError` Network request failed - {@link DeepcrawlNetworkError}
   * @throws `DeepcrawlRateLimitError` Rate limit exceeded - {@link DeepcrawlRateLimitError}
   *
   */
  async getOneLog(options: GetOneLogOptions): Promise<GetOneLogResponse> {
    const [error, data] = await this.safeClient.logs.getOne(options);

    if (error) {
      handleDeepcrawlError(error, 'read', 'Failed to fetch log');
    }

    return data as GetOneLogResponse;
  }

  /**
   * ---
   *
   * @method async `exportResponse()` - Export response data by request ID in specified format (JSON, markdown, or links tree).
   * @returns {Promise<ExportResponseOutput>} Promise<{@link ExportResponseOutput}> - Exported response data based on format
   * @param options exportResponseOptions ({@link ExportResponseOptions options: ExportResponseOptions}) - Request ID and desired export format
   *
   * Export formats:
   * - **`json`**: Full response object (all endpoints)
   * - **`markdown`**: Markdown string (from getMarkdown or readUrl with markdown enabled)
   * - **`links`**: Links tree data (from getLinks or extractLinks with tree enabled)
   *
   * @example Export as JSON
   * ```typescript
   * import { DeepcrawlApp, ExportResponseOutput } from 'deepcrawl';
   *
   * const dc = new DeepcrawlApp({ apiKey: 'your-api-key' });
   *
   * // Export full response as JSON
   * const jsonData: ExportResponseOutput = await dc.exportResponse({
   *   id: 'log-123',
   *   format: 'json'
   * });
   * ```
   *
   * @example Export markdown
   * ```typescript
   * // Export markdown from getMarkdown or readUrl request
   * const markdown: ExportResponseOutput = await dc.exportResponse({
   *   id: 'log-123',
   *   format: 'markdown'
   * });
   * // Returns markdown string
   * ```
   *
   * @example Export links tree
   * ```typescript
   * // Export links tree from getLinks or extractLinks request
   * const linksTree: ExportResponseOutput = await dc.exportResponse({
   *   id: 'log-123',
   *   format: 'links'
   * });
   * // Returns SiteTree object
   * ```
   *
   * @throws `DeepcrawlAuthError` Invalid or missing API key - {@link DeepcrawlAuthError}
   * @throws `DeepcrawlNotFoundError` Log not found - {@link DeepcrawlNotFoundError}
   * @throws `DeepcrawlValidationError` Invalid export format or request ID - {@link DeepcrawlValidationError}
   * @throws `DeepcrawlNetworkError` Network request failed - {@link DeepcrawlNetworkError}
   * @throws `DeepcrawlRateLimitError` Rate limit exceeded - {@link DeepcrawlRateLimitError}
   *
   */
  async exportResponse(
    options: ExportResponseOptions,
  ): Promise<ExportResponseOutput> {
    const [error, data] = await this.safeClient.logs.exportResponse(options);

    if (error) {
      handleDeepcrawlError(error, 'read', 'Failed to export response');
    }

    return data as ExportResponseOutput;
  }
}

export default DeepcrawlApp;
