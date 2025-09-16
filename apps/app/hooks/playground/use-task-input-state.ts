import { DEFAULT_CACHE_OPTIONS, DEFAULT_SCRAPE_OPTIONS } from '@deepcrawl/types/configs';
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
  const [options, setOptions] = useState({
    readUrl: { url: '' } as ReadUrlOptions,
    extractLinks: { url: '' } as ExtractLinksOptions,
    getMarkdown: { url: '' } as GetMarkdownOptions,
  });

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

  // Helper function for cleaning processor management
  const getCurrentProcessor = () => {
    const currentOptions = options[selectedOperation];
    return (
      currentOptions?.cleaningProcessor ||
      DEFAULT_SCRAPE_OPTIONS.cleaningProcessor
    );
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

  // Helper functions for cache options management
  const getCurrentCacheOptions = () => {
    const currentOptions = options[selectedOperation];
    return currentOptions?.cacheOptions;
  };

  const getDefaultTtl = () => {
    if (selectedOperation === 'readUrl') {
      return 345600; // 4 days default for readUrl
    }
    if (selectedOperation === 'extractLinks') {
      return 345600; // 4 days default for extractLinks
    }
    return DEFAULT_CACHE_OPTIONS.expirationTtl; // Default for getMarkdown
  };

  const handleCacheOptionsChange = (
    cacheOptions: ReadUrlOptions['cacheOptions'] | ExtractLinksOptions['cacheOptions'] | GetMarkdownOptions['cacheOptions'],
  ) => {
    const currentOptions = getCurrentOptions();
    handleOptionsChange({
      ...currentOptions,
      cacheOptions,
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

    // Computed
    getCurrentOptions,
    handleOptionsChange,
    getCurrentProcessor,
    handleProcessorChange,
    getCurrentCacheOptions,
    getDefaultTtl,
    handleCacheOptionsChange,
  };
}
