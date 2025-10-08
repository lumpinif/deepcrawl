import { PromptInputBody } from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { cn } from '@deepcrawl/ui/lib/utils';
import { Zap } from 'lucide-react';
import { useMemo } from 'react';
import {
  usePlaygroundActionsSelector,
  usePlaygroundCoreSelector,
} from '@/contexts/playground-context';
import { getOperationConfig } from '@/lib/playground/operations-config';
import { SpinnerButton } from '../spinner-button';
import { MetricsNumber } from './metrics-number';
import { UrlInput } from './url-input';

type PlaygroundUrlInputProps = {
  isError: boolean;
  handleUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  isUrlValid: boolean;
};

export function PlaygroundUrlInput({
  isError,
  handleUrlChange,
  handleSubmit,
  isUrlValid,
}: PlaygroundUrlInputProps) {
  // Get state from context instead of props
  const requestUrl = usePlaygroundCoreSelector('requestUrl');
  const selectedOperation = usePlaygroundCoreSelector('selectedOperation');
  const isExecuting = usePlaygroundCoreSelector('isExecuting');
  const responses = usePlaygroundCoreSelector('responses');
  const formatTime = usePlaygroundActionsSelector('formatTime');
  const getCurrentExecutionTime = usePlaygroundActionsSelector(
    'getCurrentExecutionTime',
  );
  // Get current operation config
  const selectedOPConfig = getOperationConfig(selectedOperation);

  // Memoize current execution time to avoid unnecessary recalculations
  const currentExecutionTime = useMemo(
    () => getCurrentExecutionTime(selectedOperation),
    [getCurrentExecutionTime, selectedOperation],
  );

  // Memoize loadingElement to prevent recreation on every render
  const loadingElement = useMemo(
    () => (
      <MetricsNumber
        className="text-primary-foreground transition-all duration-200 ease-out group-data-[loading=true]/spinner-button:scale-110 group-data-[loading=true]/spinner-button:animate-pulse"
        formatTime={formatTime}
        value={currentExecutionTime}
      />
    ),
    [formatTime, currentExecutionTime],
  );

  // Memoize successElement to prevent recreation on every render
  const successElement = useMemo(() => {
    const executionTime = responses[selectedOperation]?.executionTime;
    if (!executionTime) {
      return null;
    }
    return (
      <span className="flex items-center gap-2 text-primary-foreground">
        <Zap className="size-4" />
        {formatTime(executionTime, true)}
      </span>
    );
  }, [responses, selectedOperation, formatTime]);

  // Memoize buttonState computation
  const buttonState = useMemo(() => {
    if (isExecuting[selectedOperation]) {
      return 'loading';
    }
    if (isError) {
      return 'error';
    }
    return 'idle';
  }, [isExecuting, selectedOperation, isError]);

  return (
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
        buttonState={buttonState}
        buttonVariant="default"
        className="group/spinner-button mr-2 w-32"
        data-loading={isExecuting[selectedOperation]}
        disabled={isError || !isUrlValid || isExecuting[selectedOperation]}
        errorElement={<span>Try again</span>}
        isLoading={isExecuting[selectedOperation]}
        loadingElement={loadingElement}
        successElement={successElement}
        type="submit"
      >
        {selectedOPConfig?.label}
      </SpinnerButton>
    </PromptInputBody>
  );
}
