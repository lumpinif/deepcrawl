import DeepCrawlApp from './deepcrawl';

export { DeepCrawlApp, DeepCrawlApp as default } from './deepcrawl';
export {
  type DeepCrawlConfig,
  DeepCrawlError,
  DeepCrawlAuthError,
  DeepCrawlNetworkError,
} from './types';

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

const app = new DeepCrawlApp({
  apiKey: '1234567890',
});

const a = await app.getMarkdown('https://example.com');
const b = await app.readUrl('https://example.com');
const c = await app.getLinks('https://example.com');
const d = await app.extractLinks('https://example.com');
