/**
 * @file Operation-specific types for playground hooks
 *
 * This file provides URL-less versions of operation schemas for hook usage,
 * ensuring proper type safety while handling URL separately in the main hook.
 */

import {
  type ExtractLinksResponse,
  GetMarkdownOptionsSchema,
  type GetMarkdownResponse,
  LinksOptionsSchema,
  ReadOptionsSchema,
  type ReadUrlResponse,
} from 'deepcrawl';
import type z from 'zod/v4';

// The default configs already don't include URL, but the SDK types do
// So we need to omit URL from the SDK types to match our hook usage

export const GetMarkdownOptionsSchemaWithoutUrl = GetMarkdownOptionsSchema.omit(
  { url: true },
);
export const ReadUrlOptionsSchemaWithoutUrl = ReadOptionsSchema.omit({
  url: true,
});
export const LinksOptionsSchemaWithoutUrl = LinksOptionsSchema.omit({
  url: true,
});

export type GetMarkdownOptionsWithoutUrl = z.input<
  typeof GetMarkdownOptionsSchemaWithoutUrl
>;
export type ReadUrlOptionsWithoutUrl = z.input<
  typeof ReadUrlOptionsSchemaWithoutUrl
>;
export type ExtractLinksOptionsWithoutUrl = z.input<
  typeof LinksOptionsSchemaWithoutUrl
>;

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
