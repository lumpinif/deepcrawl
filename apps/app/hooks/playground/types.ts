/**
 * @file Operation-specific types for playground hooks
 *
 * This file provides URL-less versions of operation schemas for hook usage,
 * ensuring proper type safety while handling URL separately in the main hook.
 */

import type {
  ExtractLinksOptions,
  ExtractLinksResponse,
  GetMarkdownOptions,
  GetMarkdownResponse,
  ReadUrlOptions,
  ReadUrlResponse,
} from 'deepcrawl';

// const ReadUrlSchemaForHook = ReadOptionsSchema.omit({ url: true });
// export type ReadUrlOptionsForHook = z.infer<typeof ReadUrlSchemaForHook>;
// const ExtractLinksSchemaForHook = LinksOptionsSchema.omit({ url: true });
// export type ExtractLinksOptionsForHook = z.infer<
//   typeof ExtractLinksSchemaForHook
// >;
// const GetMarkdownSchemaForHook = GetMarkdownOptionsSchema.omit({ url: true });
// export type GetMarkdownOptionsForHook = z.infer<
//   typeof GetMarkdownSchemaForHook
// >;

// The default configs already don't include URL, but the SDK types do
// So we need to omit URL from the SDK types to match our hook usage
export type ReadUrlOptionsWithoutUrl = Omit<ReadUrlOptions, 'url'>;
export type ExtractLinksOptionsWithoutUrl = Omit<ExtractLinksOptions, 'url'>;
// GetMarkdown only uses a subset of ReadOptions (cacheOptions, cleaningProcessor, markdownConverterOptions)
export type GetMarkdownOptionsWithoutUrl = Omit<GetMarkdownOptions, 'url'>;

// Operation union type for type safety
export type DeepcrawlOperations = 'getMarkdown' | 'readUrl' | 'extractLinks';

export interface OperationToOptions {
  readUrl: ReadUrlOptionsWithoutUrl;
  extractLinks: ExtractLinksOptionsWithoutUrl;
  getMarkdown: GetMarkdownOptionsWithoutUrl;
}

export type OperationQueryStateMap = {
  [K in keyof OperationToOptions]: OperationQueryState<OperationToOptions[K]>;
};

export type PreservedOperationStates = {
  [K in keyof OperationToOptions]: OperationToOptions[K];
};

// Generic type for operation options update
export type OperationOptionsUpdate<T extends object> =
  | Partial<T>
  | ((prev: Readonly<T>) => T);

// Operation-specific state structure
export interface OperationQueryState<T extends object> {
  options: T;
  setOptions: (update: OperationOptionsUpdate<T>) => void;
  resetToDefaults: () => void;

  // Overloads improve IntelliSense (fallback narrows)
  getOption<K extends keyof T>(key: K): T[K] | undefined;
  getOption<K extends keyof T>(key: K, fallback: T[K]): T[K];

  isTransitioning?: boolean;
}

// helper
export function pickState<K extends keyof OperationToOptions>(
  op: K,
  map: OperationQueryStateMap,
): OperationQueryState<OperationToOptions[K]> {
  return map[op];
}

export type GetAnyOperationState = <K extends keyof OperationToOptions>(
  op: K,
) => OperationQueryState<OperationToOptions[K]>;

/* ------------------------------------------------------------------------------------ */

// Response types for API operations
export type DCResponseData =
  | GetMarkdownResponse
  | ReadUrlResponse
  | ExtractLinksResponse;

export interface PlaygroundResponseMetadata {
  executionTime?: number;
  errorType?:
    | 'read'
    | 'links'
    | 'rateLimit'
    | 'auth'
    | 'validation'
    | 'network'
    | 'server'
    | 'unknown';
  retryable?: boolean;
  retryAfter?: number;
  userMessage?: string;
}

export type PlaygroundResponse = PlaygroundResponseMetadata & {
  data?: DCResponseData;
  error?: string;
  status?: number;
  targetUrl?: string;
  timestamp?: string;
};

export type PlaygroundResponses = {
  [K in DeepcrawlOperations]?: PlaygroundResponse;
};
