'use client';

import {
  PromptInput,
  PromptInputToolbar,
  PromptInputTools,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { cn } from '@deepcrawl/ui/lib/utils';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  PlaygroundProvider,
  usePlaygroundActionsSelector,
  usePlaygroundCoreSelector,
} from '@/hooks/playground/playground-context';
import type { DeepcrawlOperations } from '@/hooks/playground/types';
import { getOperationConfig } from '@/lib/playground/operations-config';
import { isPlausibleUrl } from '@/utils/playground/url-input-pre-validation';
import { DetailedOptions } from './detailed-options';
import { DetailedOptionsAccordion } from './detailed-options-accordion';
import { OperationSelector } from './operation-selector';
import { PGResponseArea } from './pg-response-area';
import { PlaygroundOptionsMenusToolbar } from './playground-options-menus-toolbar';
import { PlaygroundUrlInput } from './playground-url-input';

// TODO: SOCIAL: FEATURE IDEA: add workflow automation allowing auto-configure based on detected url input, for example, if url includes 'github.com' we can use optimized configs for that, by using our smart currentState.setOptions generic function

// TODO: VALIDATE ALL TOOLTIPS AND DESCRIPTIONS FOR ALL OPTIONS

export interface PlaygroundOperationClientProps {
  className?: string;
  defaultOperation?: DeepcrawlOperations;
  defaultUrl?: string;
}

interface PlaygroundOperationClientContentProps {
  className?: string;
}

// Internal component that uses context
const PlaygroundOperationClientContent = ({
  className,
}: PlaygroundOperationClientContentProps) => {
  const [isError, setIsError] = useState(false);
  const [isDetailedBarOpen, setIsDetailedBarOpen] = useState(false);

  // Get state and actions from context
  const requestUrl = usePlaygroundCoreSelector('requestUrl');
  const selectedOperation = usePlaygroundCoreSelector('selectedOperation');
  const setRequestUrl = usePlaygroundActionsSelector('setRequestUrl');
  const executeApiCall = usePlaygroundActionsSelector('executeApiCall');

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
        className={cn('relative mx-auto sm:max-w-4/5', className)}
        onSubmit={(_, event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        {/* Operation selector */}
        <PromptInputToolbar>
          <PromptInputTools className="[&_button:first-child]:rounded-tl-lg [&_button:first-child]:rounded-bl-md">
            <OperationSelector />
          </PromptInputTools>
        </PromptInputToolbar>

        {/* URL input */}
        <PlaygroundUrlInput
          handleSubmit={handleSubmit}
          handleUrlChange={handleUrlChange}
          isError={isError}
          isUrlValid={isUrlValid}
        />

        {/* Option menu toolbar */}
        <PlaygroundOptionsMenusToolbar
          isDetailedBarOpen={isDetailedBarOpen}
          setIsDetailedBarOpen={setIsDetailedBarOpen}
        />

        {/* detailed options accordion */}
        <DetailedOptionsAccordion
          childrenProps={{ className: 'p-4' }}
          open={isDetailedBarOpen}
        >
          <DetailedOptions />
        </DetailedOptionsAccordion>
      </PromptInput>

      {/* Results Section */}
      <div className="mt-6 space-y-3">
        <PGResponseArea selectedOPConfig={selectedOPConfig} />
      </div>
    </>
  );
};

// Main exported component with Provider wrapper
export const PlaygroundOperationClient = ({
  className,
  defaultOperation = 'getMarkdown',
  defaultUrl = '',
}: PlaygroundOperationClientProps) => {
  return (
    <PlaygroundProvider
      defaultOperation={defaultOperation}
      defaultUrl={defaultUrl}
    >
      <PlaygroundOperationClientContent className={className} />
    </PlaygroundProvider>
  );
};
