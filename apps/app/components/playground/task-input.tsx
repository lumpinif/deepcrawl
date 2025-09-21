'use client';

import {
  DEFAULT_CACHE_OPTIONS,
  DEFAULT_MARKDOWN_CONVERTER_OPTIONS,
  DEFAULT_SCRAPE_OPTIONS,
} from '@deepcrawl/types/configs/default';
import {
  PromptInput,
  PromptInputBody,
  PromptInputToolbar,
  PromptInputTools,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { cn } from '@deepcrawl/ui/lib/utils';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTaskInputOperations } from '@/hooks/playground/use-task-input-operations';
import {
  type DeepcrawlOperations,
  useTaskInputState,
} from '@/hooks/playground/use-task-input-state';
import { getOperationConfig } from '@/lib/playground/operations-config';
import { isPlausibleUrl } from '@/utils/playground/url-input-pre-validation';
import { SpinnerButton } from '../spinner-button';
import { CacheOptionsMenu } from './cache-options-menu';
import { CleaningProcessorMenu } from './cleaning-processor-menu';
import { MarkdownOptionsMenu } from './markdown-options-menu';
import { OperationSelector } from './operation-selector';
import { PGResponseArea } from './pg-response-area';
import { TaskInputOptions } from './task-input-options';
import { UrlInput } from './url-input';

export interface TaskInputProps {
  defaultOperation?: DeepcrawlOperations;
  defaultUrl?: string;
}

export const TaskInput = ({
  defaultOperation = 'getMarkdown',
  defaultUrl = '',
}: TaskInputProps) => {
  const [isError, setIsError] = useState(false);

  // Use custom hooks for state management
  const {
    requestUrl,
    selectedOperation,
    isLoading,
    responses,
    options,
    activeRequestsRef,
    setRequestUrl,
    setSelectedOperation,
    setIsLoading,
    setResponses,
    getCurrentOptions,
    handleOptionsChange,
    handleProcessorChange,
    getCurrentOptionValue,
    handleCacheOptionsChange,
    handleMarkdownOptionsChange,
  } = useTaskInputState({ defaultOperation, defaultUrl });

  // Use custom hook for API operations
  const { executeApiCall, handleRetry, formatTime } = useTaskInputOperations({
    requestUrl,
    options,
    activeRequestsRef,
    setIsLoading,
    setResponses,
  });

  // Get current operation config
  const selectedOP = getOperationConfig(selectedOperation);

  // Memoize URL validation to prevent re-renders
  const isUrlValid = useMemo(() => {
    return requestUrl && isPlausibleUrl(requestUrl);
  }, [requestUrl]);

  const handleSubmit = () => {
    if (!isUrlValid) {
      setIsError(true);
      toast.error('Please enter a valid URL');
      return;
    }

    setIsError(false);
    // Execute API call with current operation
    executeApiCall(selectedOperation, selectedOP.label);
  };

  // Clear error when user types
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequestUrl(e.target.value);
    if (isError) {
      setIsError(false);
    }
  };

  return (
    <>
      <PromptInput
        className="relative mx-auto mt-4 sm:max-w-2/3"
        onSubmit={(_, event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <PromptInputToolbar>
          <PromptInputTools className="[&_button:first-child]:rounded-tl-lg [&_button:first-child]:rounded-bl-md">
            <OperationSelector
              isLoading={isLoading[selectedOperation]}
              onOperationChange={setSelectedOperation}
              selectedOperation={selectedOperation}
            />
          </PromptInputTools>
        </PromptInputToolbar>

        <PromptInputBody
          className={cn(
            '!flex-row items-center',
            isError &&
              '!border-destructive animate-shake rounded border-[1.5px] shadow-lg !focus-visible:ring-destructive transition-all duration-200 ease-out',
          )}
        >
          <UrlInput
            autoFocus={true}
            isError={isError}
            onChange={handleUrlChange}
            onSubmit={handleSubmit}
            placeholder="Enter URL here..."
            type="text"
            value={requestUrl}
          />
          <SpinnerButton
            className={cn('mr-2 w-32', isError && 'z-50 animate-none')}
            disabled={isError || !isUrlValid || isLoading[selectedOperation]}
            isLoading={isLoading[selectedOP?.operation || '']}
            type="submit"
          >
            {selectedOP?.label}
          </SpinnerButton>
        </PromptInputBody>

        <PromptInputToolbar>
          <PromptInputTools className="gap-x-0">
            <TaskInputOptions
              onOptionsChange={handleOptionsChange}
              options={getCurrentOptions()}
              selectedOperation={selectedOperation}
            />
            <CleaningProcessorMenu
              onProcessorChange={handleProcessorChange}
              processor={getCurrentOptionValue(
                'cleaningProcessor',
                DEFAULT_SCRAPE_OPTIONS.cleaningProcessor,
              )}
            />
            <CacheOptionsMenu
              cacheOptions={getCurrentOptionValue(
                'cacheOptions',
                DEFAULT_CACHE_OPTIONS,
              )}
              onCacheOptionsChange={handleCacheOptionsChange}
            />
            <MarkdownOptionsMenu
              markdownOptions={getCurrentOptionValue(
                'markdownConverterOptions',
                DEFAULT_MARKDOWN_CONVERTER_OPTIONS,
              )}
              onMarkdownOptionsChange={handleMarkdownOptionsChange}
            />
          </PromptInputTools>
        </PromptInputToolbar>
      </PromptInput>

      {/* Results Section */}
      {responses[selectedOperation] && (
        <div className="mt-6 space-y-3">
          <PGResponseArea
            formatTime={formatTime}
            onRetry={() => {
              handleRetry(selectedOperation, selectedOP.label);
            }}
            operation={selectedOperation}
            operationLabel={selectedOP.label}
            operationMethod={selectedOP.method}
            response={responses[selectedOperation]}
          />
        </div>
      )}
    </>
  );
};
