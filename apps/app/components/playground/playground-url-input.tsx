import { PromptInputBody } from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { cn } from '@deepcrawl/ui/lib/utils';
import NumberFlow, { continuous } from '@number-flow/react';
import { Zap } from 'lucide-react';
import type {
  DeepcrawlOperations,
  PlaygroundResponses,
} from '@/hooks/playground';
import { getOperationConfig } from '@/lib/playground/operations-config';
import { SpinnerButton } from '../spinner-button';
import { UrlInput } from './url-input';

type PlaygroundUrlInputProps = {
  isError: boolean;
  selectedOperation: DeepcrawlOperations;
  handleUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  requestUrl: string;
  responses: PlaygroundResponses;
  isExecuting: Record<DeepcrawlOperations, boolean>;
  getCurrentExecutionTime: (operationId: string) => number;
  formatTime: (ms: number, asString?: boolean) => number | string;
  isUrlValid: boolean;
};

export function PlaygroundUrlInput({
  isError,
  handleUrlChange,
  handleSubmit,
  requestUrl,
  isExecuting,
  isUrlValid,
  selectedOperation,
  responses,
  getCurrentExecutionTime,
  formatTime,
}: PlaygroundUrlInputProps) {
  // Get current operation config
  const selectedOPConfig = getOperationConfig(selectedOperation);

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
        buttonState={
          isExecuting[selectedOperation]
            ? 'loading'
            : isError
              ? 'error'
              : 'idle'
        }
        buttonVariant="default"
        className="group/spinner-button mr-2 w-32"
        data-loading={isExecuting[selectedOperation]}
        disabled={isError || !isUrlValid || isExecuting[selectedOperation]}
        errorElement={<span>Try again</span>}
        isLoading={isExecuting[selectedOperation]}
        loadingElement={
          <NumberFlow
            className="text-primary-foreground transition-all duration-200 ease-out group-data-[loading=true]/spinner-button:scale-110 group-data-[loading=true]/spinner-button:animate-pulse"
            format={{
              style: 'decimal',
              signDisplay: 'auto',
              maximumFractionDigits:
                getCurrentExecutionTime(selectedOperation) > 1000 ? 2 : 0,
            }}
            plugins={[continuous]}
            suffix={
              getCurrentExecutionTime(selectedOperation) > 1000 ? ' s' : ' ms'
            }
            value={
              formatTime(
                getCurrentExecutionTime(selectedOperation),
                false, // asString = false
              ) as number
            }
            willChange={true}
          />
        }
        successElement={
          responses[selectedOperation]?.executionTime && (
            <span className="flex items-center gap-2 text-primary-foreground">
              <Zap className="size-4" />
              {formatTime(responses[selectedOperation].executionTime, true)}
            </span>
          )
        }
        type="submit"
      >
        {selectedOPConfig?.label}
      </SpinnerButton>
    </PromptInputBody>
  );
}
