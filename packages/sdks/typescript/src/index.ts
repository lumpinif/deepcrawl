import DeepcrawlApp from './deepcrawl';

export { DeepcrawlApp, DeepcrawlApp as default } from './deepcrawl';
export {
  type DeepcrawlConfig as DeepCrawlConfig,
  DeepcrawlError as DeepCrawlError,
  DeepcrawlAuthError as DeepCrawlAuthError,
  DeepcrawlNetworkError as DeepCrawlNetworkError,
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

const app = new DeepcrawlApp({ apiKey: '1234567890' });
// temp test
const result = await app.extractLinks('https://www.google.com');
