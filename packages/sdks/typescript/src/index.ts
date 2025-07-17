// Export contract types for advanced users
export type { contract as DeepCrawlContract } from '@deepcrawl/contracts';
export type { ContractRouterClient } from '@orpc/contract';
export { DeepcrawlApp as default, DeepcrawlApp } from './deepcrawl';
export {
  DeepcrawlAuthError,
  type DeepcrawlConfig,
  DeepcrawlError,
  DeepcrawlLinksError,
  DeepcrawlNetworkError,
  DeepcrawlReadError,
} from './types';

// Type helper for creating custom clients
import type { ContractRouterClient as CRC } from '@orpc/contract';
export type DeepCrawlClient = CRC<
  typeof import('@deepcrawl/contracts').contract
>;

export type {
  Inputs,
  LinksGETInput,
  LinksGETOutput,
  LinksPOSTInput,
  LinksPOSTOutput,
  Outputs,
  ReadGETInput,
  ReadGETOutput,
  ReadPOSTInput,
  ReadPOSTOutput,
} from '@deepcrawl/contracts';

export type {
  HTMLCleaningOptions,
  LinkExtractionOptions,
  LinksErrorResponse,
  LinksOptions,
  LinksSuccessResponse,
  MetadataOptions,
  PageMetadata,
  ReadErrorResponse,
  ReadOptions,
  ReadPostResponse,
  ReadStringResponse,
  ReadSuccessResponse,
  ScrapedData,
} from '@deepcrawl/types';
