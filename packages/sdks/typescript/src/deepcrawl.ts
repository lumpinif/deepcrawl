import type {
  LinksGETOutput,
  LinksPOSTInput,
  LinksPOSTOutput,
  ReadPOSTOutput,
  contract,
} from '@deepcrawl/contracts';
import type { LinksOptions, ReadOptions } from '@deepcrawl/types';
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import type { ContractRouterClient } from '@orpc/contract';
import { DeepcrawlAuthError, type DeepcrawlConfig } from './types';

export class DeepcrawlApp {
  public client: ContractRouterClient<typeof contract>;
  private config: DeepcrawlConfig;

  constructor(config: DeepcrawlConfig) {
    this.config = {
      baseUrl: 'https://api.deepcrawl.dev',
      ...config,
    };

    if (!this.config.apiKey) {
      throw new DeepcrawlAuthError('API key is required');
    }

    const link = new RPCLink({
      url: () => {
        if (typeof window === 'undefined') {
          throw new Error('RPCLink is not allowed on the server side.');
        }

        return `${this.config.baseUrl}/rpc` || `${window.location.origin}/rpc`;
      },
      headers: () => ({
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': '@deepcrawl-sdk/ts',
        ...this.config.headers,
      }),
      fetch: (request, init) =>
        globalThis.fetch(request, {
          ...init,
          credentials: 'include', // Keep this to include cookies for cross-origin requests
        }),
    });

    this.client = createORPCClient(link);
  }

  /* Read GET */
  /**
   * @param url - The URL to get the markdown for.
   * @returns The markdown.
   */
  async getMarkdown(url: string): Promise<string> {
    const result = await this.client.read.getMarkdown({ url });
    // override the return type to string
    if (result instanceof Blob) {
      return await result.text();
    }
    return result as string;
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

    const result = await this.client.read.readWebsite(readOptions);

    return result;
  }

  /* Links GET */
  /**
   * @param url - The URL to get links from.
   * @returns The links.
   */
  async getLinks(url: string): Promise<LinksGETOutput> {
    return await this.client.links.getLinks({ url });
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
    return await this.client.links.extractLinks(linksOptions);
  }
}

export default DeepcrawlApp;
