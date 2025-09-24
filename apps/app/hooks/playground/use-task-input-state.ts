import { ReadGETInputSchema } from '@deepcrawl/contracts/read';
import { LinksOptionsSchema, ReadOptionsSchema } from '@deepcrawl/types';
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
import {
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from 'nuqs';
import { useRef, useState } from 'react';
import { z } from 'zod/v4';

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

// Combined schema for all operations options (without URL since that's managed separately)
const OperationOptionsSchema = z.object({
  getMarkdown: ReadGETInputSchema.partial().optional(),
  readUrl: ReadOptionsSchema.partial().optional(),
  extractLinks: LinksOptionsSchema.partial().optional(),
});

// Default options without URL for compact serialization
const DEFAULT_OPERATION_OPTIONS = {
  getMarkdown: { url: '', ...DEFAULT_GET_MARKDOWN_OPTIONS },
  readUrl: { url: '', ...DEFAULT_READ_OPTIONS },
  extractLinks: { url: '', ...DEFAULT_LINKS_OPTIONS },
};

type OperationOptionKey = {
  [Op in DeepcrawlOperations]: keyof OperationOptionsMap[Op];
}[DeepcrawlOperations];

type OperationOptionValue<Key extends OperationOptionKey> = {
  [Op in DeepcrawlOperations]: Key extends keyof OperationOptionsMap[Op]
    ? OperationOptionsMap[Op][Key]
    : never;
}[DeepcrawlOperations];

// Export the function type for components to use - flexible interface for component access
export type GetCurrentOptionValue = <Key extends string>(
  key: Key,
  fallback?: unknown,
) => unknown;

export type GetCurrentOptions = () => OperationOptionsMap[DeepcrawlOperations];

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
  const [requestUrl, setRequestUrl] = useQueryState(
    'url',
    parseAsString.withDefault(defaultUrl),
  );

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

  // Options state management using nuqs for URL persistence and sharing
  const [options, setOptions] = useQueryState(
    'options',
    parseAsJson(OperationOptionsSchema).withDefault(DEFAULT_OPERATION_OPTIONS),
  );

  const typedOptions = {
    getMarkdown: {
      ...DEFAULT_GET_MARKDOWN_OPTIONS,
      url: '',
      ...options.getMarkdown,
    },
    readUrl: { ...DEFAULT_READ_OPTIONS, url: '', ...options.readUrl },
    extractLinks: {
      ...DEFAULT_LINKS_OPTIONS,
      url: '',
      ...options.extractLinks,
    },
  };

  // Add deduplication ref to prevent multiple simultaneous requests
  const activeRequestsRef = useRef<Set<string>>(new Set());

  // Helper functions for cleaner OptionsPanel configuration
  const getCurrentOptions: GetCurrentOptions = () => {
    const baseOptions = typedOptions[selectedOperation] || { url: '' };
    return { ...baseOptions, url: requestUrl };
  };

  /**
   * Enhanced options change handler with auto-detection for nested object merging.
   *
   * SMART MERGING LOGIC:
   * - Direct properties (folderFirst, metadata, tree): Direct assignment
   * - Nested objects (linkExtractionOptions, cacheOptions, etc.): Auto-detected and deep merged
   * - Detection criteria: Both current and new values are plain objects (not arrays, null, etc.)
   *
   * This eliminates the need for separate merge helpers while maintaining state preservation.
   */
  const handleOptionsChange = (
    update: OperationOptionsUpdate<typeof selectedOperation>,
  ) => {
    setOptions((prev) => {
      const current = prev[
        selectedOperation
      ] as OperationOptionsMap[typeof selectedOperation];

      if (typeof update === 'function') {
        return {
          ...prev,
          [selectedOperation]: update(current),
        };
      }

      // Enhanced merging: auto-detect nested objects and merge them properly
      type NextOptionsType = OperationOptionsMap[typeof selectedOperation];
      const next: NextOptionsType = { ...current };

      // Helper function to check if a value is a plain object
      const isPlainObject = (obj: unknown): obj is Record<string, unknown> => {
        return (
          obj !== null &&
          typeof obj === 'object' &&
          !Array.isArray(obj) &&
          obj.constructor === Object
        );
      };

      for (const [key, value] of Object.entries(update)) {
        const typedKey = key as keyof typeof current;
        const currentValue = current[typedKey];

        // Auto-detect nested objects that need deep merging
        const isNestedObjectUpdate =
          isPlainObject(currentValue) && isPlainObject(value);

        if (isNestedObjectUpdate) {
          // Deep merge for nested objects with explicit Record typing
          const mergedValue = {
            ...currentValue,
            ...value,
          };
          (next as Record<keyof NextOptionsType, unknown>)[typedKey] =
            mergedValue;
        } else {
          // Direct assignment for direct properties and complete replacements
          (next as Record<keyof NextOptionsType, unknown>)[typedKey] = value;
        }
      }

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
    const operationOptions = typedOptions[selectedOperation];
    const value =
      operationOptions && key in operationOptions
        ? operationOptions[key as keyof typeof operationOptions]
        : undefined;

    return (value ?? fallback) as OperationOptionValue<Key>;
  };

  /**
   * Reset operation options to their default values
   * @param operation - Optional operation to reset. If not provided, resets all operations
   */
  const resetToDefaults = (operation?: DeepcrawlOperations) => {
    setOptions((prev) => {
      const defaultOptionsMap = {
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
          ...DEFAULT_GET_MARKDOWN_OPTIONS,
        },
      };

      if (operation) {
        // Reset only the specified operation
        return {
          ...prev,
          [operation]: {
            ...defaultOptionsMap[operation],
            url: requestUrl, // Preserve current URL
          },
        };
      }

      // Reset all operations
      return {
        readUrl: {
          ...defaultOptionsMap.readUrl,
          url: requestUrl, // Preserve current URL
        },
        extractLinks: {
          ...defaultOptionsMap.extractLinks,
          url: requestUrl, // Preserve current URL
        },
        getMarkdown: {
          ...defaultOptionsMap.getMarkdown,
          url: requestUrl, // Preserve current URL
        },
      };
    });
  };

  return {
    // State
    requestUrl,
    selectedOperation,
    isLoading,
    responses,
    options: typedOptions,
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
    resetToDefaults,
  };
}
