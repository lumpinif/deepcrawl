export { DeepcrawlApp as default, DeepcrawlApp } from './deepcrawl';
export {
  DeepcrawlAuthError,
  DeepcrawlError,
  DeepcrawlLinksError,
  DeepcrawlNetworkError,
  DeepcrawlReadError,
  type DeepcrawlConfig,
} from './types';

// Export contract types for advanced users
export type { contract as DeepCrawlContract } from '@deepcrawl/contracts';
export type { ContractRouterClient } from '@orpc/contract';

// Type helper for creating custom clients
import type { ContractRouterClient as CRC } from '@orpc/contract';
export type DeepCrawlClient = CRC<
  typeof import('@deepcrawl/contracts').contract
>;

export type {
  Inputs,
  Outputs,
} from '@deepcrawl/contracts';

export type {
  ReadGETInput,
  ReadGETOutput,
  ReadPOSTInput,
  ReadPOSTOutput,
  LinksGETInput,
  LinksGETOutput,
  LinksPOSTInput,
  LinksPOSTOutput,
} from '@deepcrawl/contracts';

export type {
  ScrapedData,
  PageMetadata,
  HTMLCleaningOptions,
  LinkExtractionOptions,
  MetadataOptions,
  ReadOptions,
  ReadPostResponse,
  ReadSuccessResponse,
  ReadErrorResponse,
  ReadStringResponse,
  LinksOptions,
  LinksSuccessResponse,
  LinksErrorResponse,
} from '@deepcrawl/types';
