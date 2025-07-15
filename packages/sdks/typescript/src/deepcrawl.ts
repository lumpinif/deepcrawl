import type {
  LinksGETOutput,
  LinksPOSTInput,
  LinksPOSTOutput,
  ReadPOSTOutput,
  contract,
} from '@deepcrawl/contracts';
import type { LinksOptions, ReadOptions } from '@deepcrawl/types';
import { createORPCClient, isDefinedError, safe } from '@orpc/client';
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
  DeepcrawlReadError,
} from './types';

interface DeepCrawlClientContext extends ClientRetryPluginContext {}

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
              // Retry read operations up to 3 times
              if (path[0] === 'read') return 3;
              // Retry link operations up to 2 times
              if (path[0] === 'links') return 2;
              return 0;
            },
            retryDelay: ({ attemptIndex }) =>
              Math.min(1000 * Math.pow(2, attemptIndex), 10000), // Exponential backoff
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
  async getMarkdown(url: string): Promise<string> {
    const [error, data] = await safe(this.client.read.getMarkdown({ url }));

    if (isDefinedError(error)) {
      // Throw specific read error with detailed information
      throw new DeepcrawlReadError(error.data);
    }

    // @ts-ignore TODO: FIX ERROR TYPE
    if (!isDefinedError(error) && error?.code === 'UNAUTHORIZED') {
      throw new DeepcrawlAuthError('Unauthorized');
    }

    if (error) {
      throw new DeepcrawlNetworkError('Failed to fetch markdown', error);
    }

    // override the return type to string
    if (data instanceof Blob) {
      return await data.text();
    }
    return data as string;
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
  ): Promise<ReadPOSTOutput> {
    const readOptions: ReadOptions = {
      url,
      ...options,
    };

    const [error, data] = await safe(this.client.read.readUrl(readOptions));

    if (isDefinedError(error)) {
      // Throw specific read error with detailed information
      throw new DeepcrawlReadError(error.data);
    }

    // @ts-ignore TODO: FIX ERROR TYPE
    if (!isDefinedError(error) && error?.code === 'UNAUTHORIZED') {
      throw new DeepcrawlAuthError('Unauthorized');
    }

    if (error) {
      throw new DeepcrawlNetworkError('Failed to read URL', error);
    }

    return data;
  }

  /* Links GET */
  /**
   * @param url - The URL to get links from.
   * @returns The links.
   */
  async getLinks(url: string): Promise<LinksGETOutput> {
    const [error, data] = await safe(this.client.links.getLinks({ url }));

    if (isDefinedError(error)) {
      // Throw specific links error with detailed information
      throw new DeepcrawlLinksError(error.data);
    }
    // @ts-ignore TODO: FIX ERROR TYPE
    if (!isDefinedError(error) && error?.code === 'UNAUTHORIZED') {
      throw new DeepcrawlAuthError('Unauthorized');
    }

    if (error) {
      throw new DeepcrawlNetworkError('Failed to get links', error);
    }

    return data;
  }

  /* Links POST */
  /**
   * @param url - The URL to extract links from.
   * @param options - The options to use for the extraction.
   * @returns The extracted links.
   */
  async extractLinks(
    url: string,
    options: Omit<LinksOptions, 'url'> = {},
  ): Promise<LinksPOSTOutput> {
    const linksOptions: LinksPOSTInput = {
      url,
      ...options,
    };

    const [error, data] = await safe(
      this.client.links.extractLinks(linksOptions),
    );

    if (isDefinedError(error)) {
      // Throw specific links error with detailed information
      throw new DeepcrawlLinksError(error.data);
    }
    // @ts-ignore TODO: FIX ERROR TYPE
    if (!isDefinedError(error) && error?.code === 'UNAUTHORIZED') {
      throw new DeepcrawlAuthError('Unauthorized');
    }

    if (error) {
      throw new DeepcrawlNetworkError('Failed to extract links', error);
    }

    return data;
  }
}

export default DeepcrawlApp;
