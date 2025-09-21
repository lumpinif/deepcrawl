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

  // Options state management - consolidated for cleaner access
  const [options, setOptions] = useState<OperationOptionsMap>(() => ({
    readUrl: { url: '' },
    extractLinks: { url: '' },
    getMarkdown: { url: '' },
  }));

  // Add deduplication ref to prevent multiple simultaneous requests
  const activeRequestsRef = useRef<Set<string>>(new Set());

  // Helper functions for cleaner OptionsPanel configuration
  const getCurrentOptions = () => {
    const baseOptions = options[selectedOperation] || { url: '' };
    return { ...baseOptions, url: requestUrl };
  };

  const handleOptionsChange = (
    newOptions: ReadUrlOptions | ExtractLinksOptions | GetMarkdownOptions,
  ) => {
    setOptions((prev) => ({
      ...prev,
      [selectedOperation]: newOptions,
    }));
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

  const handleProcessorChange = (
    processor: 'cheerio-reader' | 'html-rewriter',
  ) => {
    const currentOptions = getCurrentOptions();
    handleOptionsChange({
      ...currentOptions,
      cleaningProcessor: processor,
    });
  };

  const handleCacheOptionsChange = (
    cacheOptions:
      | ReadUrlOptions['cacheOptions']
      | ExtractLinksOptions['cacheOptions']
      | GetMarkdownOptions['cacheOptions'],
  ) => {
    const currentOptions = getCurrentOptions();
    handleOptionsChange({
      ...currentOptions,
      cacheOptions,
    });
  };

  const handleMarkdownOptionsChange = (
    markdownConverterOptions:
      | ReadUrlOptions['markdownConverterOptions']
      | GetMarkdownOptions['markdownConverterOptions'],
  ) => {
    const currentOptions = getCurrentOptions();
    handleOptionsChange({
      ...currentOptions,
      markdownConverterOptions,
    });
  };

  const handleContentFormatOptionsChange = (
    contentFormatOptions: Pick<
      ReadUrlOptions,
      'metadata' | 'markdown' | 'cleanedHtml' | 'rawHtml' | 'robots'
    >,
  ) => {
    const currentOptions = getCurrentOptions();
    handleOptionsChange({
      ...currentOptions,
      ...contentFormatOptions,
    });
  };

  const handleMetadataOptionsChange = (
    metadataOptions:
      | ReadUrlOptions['metadataOptions']
      | ExtractLinksOptions['metadataOptions'],
  ) => {
    const currentOptions = getCurrentOptions();
    handleOptionsChange({
      ...currentOptions,
      metadataOptions,
    });
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

    // Computed
    handleProcessorChange,
    handleCacheOptionsChange,
    handleMarkdownOptionsChange,
    handleContentFormatOptionsChange,
    handleMetadataOptionsChange,
  };
}
