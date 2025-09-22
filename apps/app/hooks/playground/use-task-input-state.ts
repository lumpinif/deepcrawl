import {
  DEFAULT_GET_MARKDOWN_OPTIONS,
  DEFAULT_LINKS_OPTIONS,
  DEFAULT_READ_OPTIONS,
} from '@deepcrawl/types/configs';
import type {
  ExtractLinksOptions,
  ExtractLinksResponse,
  GetMarkdownOptions,
  GetMarkdownResponse,
  ReadUrlOptions,
  ReadUrlResponse,
} from 'deepcrawl';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useRef, useState } from 'react';

// Types
export type DeepcrawlOperations = 'getMarkdown' | 'readUrl' | 'extractLinks';

export type DCResponseData =
  | GetMarkdownResponse
  | ReadUrlResponse
  | ExtractLinksResponse;

type OperationOptionsMap = {
  getMarkdown: GetMarkdownOptions;
  readUrl: ReadUrlOptions;
  extractLinks: ExtractLinksOptions;
};

type OperationOptionKey = {
  [Op in DeepcrawlOperations]: keyof OperationOptionsMap[Op];
}[DeepcrawlOperations];

type OperationOptionValue<Key extends OperationOptionKey> = {
  [Op in DeepcrawlOperations]: Key extends keyof OperationOptionsMap[Op]
    ? OperationOptionsMap[Op][Key]
    : never;
}[DeepcrawlOperations];

type OperationOptionsUpdate<Op extends DeepcrawlOperations> =
  | Partial<OperationOptionsMap[Op]>
  | ((current: OperationOptionsMap[Op]) => OperationOptionsMap[Op]);

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

const operations: readonly DeepcrawlOperations[] = [
  'getMarkdown',
  'readUrl',
  'extractLinks',
] as const;

interface UseTaskInputStateProps {
  defaultOperation?: DeepcrawlOperations;
  defaultUrl?: string;
}

export function useTaskInputState({
  defaultOperation = 'getMarkdown',
  defaultUrl = '',
}: UseTaskInputStateProps = {}) {
  // URL state management
  const [requestUrl, setRequestUrl] = useState(defaultUrl);

  // Operation state management using useQueryState for persistence
  const [selectedOperation, setSelectedOperation] = useQueryState(
    'operation',
    parseAsStringLiteral(operations).withDefault(defaultOperation),
  );

  // Loading state management - separate state for each operation
  const [isLoading, setIsLoading] = useState<
    Record<DeepcrawlOperations, boolean>
  >({
    getMarkdown: false,
    readUrl: false,
    extractLinks: false,
  });

  // Response state management
  const [responses, setResponses] = useState<
    Record<string, PlaygroundResponse>
  >({});

  // Options state management - consolidated for cleaner access with full defaults
  const [options, setOptions] = useState<OperationOptionsMap>(() => ({
    readUrl: {
      url: '',
      ...DEFAULT_READ_OPTIONS,
    },
    extractLinks: {
      url: '',
      ...DEFAULT_LINKS_OPTIONS,
    },
    getMarkdown: {
      url: '',
      ...DEFAULT_GET_MARKDOWN_OPTIONS, // getMarkdown uses similar options to readUrl
    },
  }));

  // Add deduplication ref to prevent multiple simultaneous requests
  const activeRequestsRef = useRef<Set<string>>(new Set());

  // Helper functions for cleaner OptionsPanel configuration
  const getCurrentOptions = () => {
    const baseOptions = options[selectedOperation] || { url: '' };
    return { ...baseOptions, url: requestUrl };
  };

  const handleOptionsChange = (
    update: OperationOptionsUpdate<typeof selectedOperation>,
  ) => {
    setOptions((prev) => {
      const current = prev[
        selectedOperation
      ] as OperationOptionsMap[typeof selectedOperation];
      const next =
        typeof update === 'function'
          ? update(current)
          : ({
              ...current,
              ...update,
            } as OperationOptionsMap[typeof selectedOperation]);

      return {
        ...prev,
        [selectedOperation]: next,
      };
    });
  };

  const getCurrentOptionValue = <Key extends OperationOptionKey>(
    key: Key,
    fallback?: OperationOptionValue<Key>,
  ): OperationOptionValue<Key> => {
    const operationOptions = options[selectedOperation];
    const value =
      operationOptions && key in operationOptions
        ? operationOptions[key as keyof typeof operationOptions]
        : undefined;

    return (value ?? fallback) as OperationOptionValue<Key>;
  };

  return {
    // State
    requestUrl,
    selectedOperation,
    isLoading,
    responses,
    options,
    activeRequestsRef,

    // Actions
    setRequestUrl,
    setSelectedOperation,
    setIsLoading,
    setResponses,
    setOptions,

    // Helpers
    getCurrentOptions,
    getCurrentOptionValue,
    handleOptionsChange,
  };
}
