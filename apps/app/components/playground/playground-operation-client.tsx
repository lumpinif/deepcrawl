'use client';

import {
  PromptInput,
  PromptInputToolbar,
  PromptInputTools,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  type DeepcrawlOperations,
  useEnhancedTaskInputState,
} from '@/hooks/playground';
import { useTaskInputOperations } from '@/hooks/playground/use-task-input-operations';
import { getOperationConfig } from '@/lib/playground/operations-config';
import { isPlausibleUrl } from '@/utils/playground/url-input-pre-validation';
// import { DetailedOptions } from './detailed-options';
import { DetailedOptionsAccordion } from './detailed-options-accordion';

import { OperationSelector } from './operation-selector';
import { PGResponseArea } from './pg-response-area';
import { PlaygroundOptionsMenusToolbar } from './playground-options-menus-toolbar';
import { PlaygroundUrlInput } from './playground-url-input';

// TODO: SOCIAL: FEATURE IDEA: add workflow automation allowing auto-configure based on detected url input, for example, if url includes 'github.com' we can use optimized configs for that, by using our smart currentState.setOptions generic function

// TODO: VALIDATE ALL TOOLTIPS AND DESCRIPTIONS FOR ALL OPTIONS

export interface PlaygroundOperationClientProps {
  defaultOperation?: DeepcrawlOperations;
  defaultUrl?: string;
}

export const PlaygroundOperationClient = ({
  defaultOperation = 'getMarkdown',
  defaultUrl = '',
}: PlaygroundOperationClientProps) => {
  const [isError, setIsError] = useState(false);
  const [isDetailedBarOpen, setIsDetailedBarOpen] = useState(false);

  // Use enhanced state management with operation-specific hooks
  const {
    requestUrl,
    selectedOperation,
    isExecuting,
    responses,
    activeRequestsRef,
    setRequestUrl,
    setSelectedOperation,
    setIsExecuting,
    setResponses,
    currentQueryState,
    // resetToDefaults,
    getAnyOperationState,
  } = useEnhancedTaskInputState({ defaultOperation, defaultUrl });

  // Use custom hook for API operations
  const { executeApiCall, handleRetry, formatTime, getCurrentExecutionTime } =
    useTaskInputOperations({
      requestUrl,
      getAnyOperationState,
      activeRequestsRef,
      setIsExecuting,
      setResponses,
    });

  // Get current operation config
  const selectedOPConfig = getOperationConfig(selectedOperation);

  // Memoize URL validation to prevent re-renders
  const isUrlValid = useMemo(() => {
    return Boolean(requestUrl && isPlausibleUrl(requestUrl));
  }, [requestUrl]);

  const handleSubmit = () => {
    if (!isUrlValid) {
      setIsError(true);
      toast.error('Please enter a valid URL');
      return;
    }

    setIsError(false);
    // Execute API call with current operation
    executeApiCall(selectedOperation, selectedOPConfig.label);
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
        {/* Operation selector */}
        <PromptInputToolbar>
          <PromptInputTools className="[&_button:first-child]:rounded-tl-lg [&_button:first-child]:rounded-bl-md">
            <OperationSelector
              isLoading={isExecuting[selectedOperation]}
              onOperationChange={setSelectedOperation}
              selectedOperation={selectedOperation}
            />
          </PromptInputTools>
        </PromptInputToolbar>

        {/* URL input */}
        <PlaygroundUrlInput
          formatTime={formatTime}
          getCurrentExecutionTime={getCurrentExecutionTime}
          handleSubmit={handleSubmit}
          handleUrlChange={handleUrlChange}
          isError={isError}
          isExecuting={isExecuting}
          isUrlValid={isUrlValid}
          requestUrl={requestUrl}
          responses={responses}
          selectedOperation={selectedOperation}
        />

        {/* Option menu toolbar */}
        <PlaygroundOptionsMenusToolbar
          currentQueryState={currentQueryState}
          getAnyOperationState={getAnyOperationState}
          isDetailedBarOpen={isDetailedBarOpen}
          selectedOperation={selectedOperation}
          setIsDetailedBarOpen={setIsDetailedBarOpen}
        />

        {/* detailed options accordion */}
        <DetailedOptionsAccordion
          childrenProps={{ className: 'p-4' }}
          open={isDetailedBarOpen}
        >
          {/* We will fix it later */}
          {/* <DetailedOptions
            operation={selectedOperation}
            options={currentOpts}
            requestUrl={requestUrl}
            resetToDefaults={resetToDefaults}
          /> */}
        </DetailedOptionsAccordion>
      </PromptInput>

      {/* Results Section */}
      {responses[selectedOperation] && (
        <div className="mt-6 space-y-3">
          <PGResponseArea
            formatTime={formatTime}
            onRetry={() => {
              handleRetry(selectedOperation, selectedOPConfig.label);
            }}
            operation={selectedOperation}
            operationLabel={selectedOPConfig.label}
            operationMethod={selectedOPConfig.method}
            response={responses[selectedOperation]}
          />
        </div>
      )}
    </>
  );
};
