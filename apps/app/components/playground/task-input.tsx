'use client';

import {
  PromptInput,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputToolbar,
  PromptInputTools,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { useTaskInputOperations } from '@/hooks/playground/use-task-input-operations';
import {
  type DeepcrawlOperations,
  useTaskInputState,
} from '@/hooks/playground/use-task-input-state';
import { getOperationConfig } from '@/lib/playground/operations-config';
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

  return (
    <>
      <PromptInput
        className="relative mx-auto mt-4 sm:max-w-2/3"
        onSubmit={(_, event) => {
          event.preventDefault();
          // Execute API call with current operation
          executeApiCall(selectedOperation, selectedOP.label);
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

        <PromptInputBody>
          <UrlInput
            onChange={(e) => setRequestUrl(e.target.value)}
            placeholder="Enter URL..."
            type="text"
            value={requestUrl}
          />
        </PromptInputBody>

        <PromptInputToolbar>
          <PromptInputTools>
            <TaskInputOptions
              onOptionsChange={handleOptionsChange}
              options={getCurrentOptions()}
              selectedOperation={selectedOperation}
            />
          </PromptInputTools>
          <PromptInputSubmit
            disabled={!requestUrl || isLoading[selectedOperation]}
            size="default"
          >
            {selectedOP.label}
          </PromptInputSubmit>
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
