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
import type { UseQueryStateOptions } from 'nuqs';
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

/* NOTE: WE ARE USING INPUT TYPES HERE TO DEFINE THE OPTIONS, WHICH MAY CONTAIN SMARTBOOL AS STRING */
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

export interface GetOptionFor {
  <Op extends keyof OperationToOptions, Key extends keyof OperationToOptions[Op]>(
    operation: Op,
    key: Key,
  ): OperationToOptions[Op][Key] | undefined;
  <Op extends keyof OperationToOptions, Key extends keyof OperationToOptions[Op]>(
    operation: Op,
    key: Key,
    fallback: OperationToOptions[Op][Key],
  ): OperationToOptions[Op][Key];
}

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
  defaults: T;
  setOptions: (update: OperationOptionsUpdate<T>) => void;
  resetToDefaults: () => void;

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

/* ------------------------------------------------------------------------------------ */
/* REACT CONTEXT TYPES FOR GRANULAR STATE MANAGEMENT */
/* ------------------------------------------------------------------------------------ */

// Core playground state - URL, operation, execution status, responses
export interface PlaygroundCoreState {
  requestUrl: string;
  selectedOperation: DeepcrawlOperations;
  isExecuting: Record<DeepcrawlOperations, boolean>;
  responses: PlaygroundResponses;
  activeRequestsRef: React.RefObject<Set<string>>;
}

// Operation-specific options state with current operation focus
export interface PlaygroundOptionsState {
  // Current operation's query state for direct access
  currentQueryState: OperationQueryState<
    OperationToOptions[DeepcrawlOperations]
  >;
  // All operation states for cross-operation access
  operationQueryStates: OperationQueryStateMap;
  // Utility getter for any operation state
  getAnyOperationState: GetAnyOperationState;
  // Option getter with operation narrowing
  getOptionFor: GetOptionFor;
  // Direct access to current operation options (convenience)
  currentOptions: OperationToOptions[DeepcrawlOperations];
}

// All action functions for state updates
export interface PlaygroundActions {
  // Core actions
  setRequestUrl: (
    value: string | ((old: string) => string | null) | null,
    options?: UseQueryStateOptions<string>,
  ) => Promise<URLSearchParams>;
  setSelectedOperation: (
    value:
      | DeepcrawlOperations
      | ((old: DeepcrawlOperations) => DeepcrawlOperations | null)
      | null,
    options?: UseQueryStateOptions<DeepcrawlOperations>,
  ) => Promise<URLSearchParams>;
  setIsExecuting: (
    fn: (
      prev: Record<DeepcrawlOperations, boolean>,
    ) => Record<DeepcrawlOperations, boolean>,
  ) => void;
  setResponses: (
    fn: (prev: PlaygroundResponses) => PlaygroundResponses,
  ) => void;

  // Option actions
  resetToDefaults: (operation?: DeepcrawlOperations) => void;

  // API operations
  executeApiCall: (
    operation: DeepcrawlOperations,
    label: string,
  ) => Promise<void>;
  handleRetry: (operation: DeepcrawlOperations, label: string) => void;

  // Utility functions
  formatTime: (ms: number, asString?: boolean) => number | string;
  getCurrentExecutionTime: (operation: DeepcrawlOperations) => number;
}

// Context provider props
export interface PlaygroundProviderProps {
  children: React.ReactNode;
  defaultOperation?: DeepcrawlOperations;
  defaultUrl?: string;
}

// Hook return types for granular access
export interface UsePlaygroundCoreReturn extends PlaygroundCoreState {}

export interface UsePlaygroundOptionsReturn extends PlaygroundOptionsState {}

export interface UsePlaygroundActionsReturn extends PlaygroundActions {}

// Combined hook return for backward compatibility
export interface UsePlaygroundReturn
  extends PlaygroundCoreState,
    PlaygroundOptionsState,
    PlaygroundActions {}

// Provider context values (internal)
export interface PlaygroundCoreContextValue extends PlaygroundCoreState {}
export interface PlaygroundOptionsContextValue extends PlaygroundOptionsState {}
export interface PlaygroundActionsContextValue extends PlaygroundActions {}
