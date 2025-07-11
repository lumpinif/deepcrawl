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
import {
  DeepcrawlAuthError,
  type DeepcrawlConfig,
  DeepcrawlError,
  DeepcrawlNetworkError,
} from './types';

interface DeepCrawlClientContext extends ClientRetryPluginContext {}

export class DeepcrawlApp {
  public client: ContractRouterClient<typeof contract, DeepCrawlClientContext>;
  private config: DeepcrawlConfig;

  constructor(config: DeepcrawlConfig) {
    this.config = {
      baseUrl: 'https://api.deepcrawl.dev',
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
      headers: () => ({
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': '@deepcrawl-sdk/ts',
        ...this.config.headers,
      }),
      fetch: (request, init) =>
        fetchImpl(request, {
          ...init,
          credentials: 'include', // Keep this to include cookies for cross-origin requests
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
      throw new DeepcrawlError(error.message);
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
      throw new DeepcrawlError(error.message);
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
      throw new DeepcrawlError(error.message);
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
      throw new DeepcrawlError(error.message);
    }
    if (error) {
      throw new DeepcrawlNetworkError('Failed to extract links', error);
    }

    return data;
  }
}

export default DeepcrawlApp;
