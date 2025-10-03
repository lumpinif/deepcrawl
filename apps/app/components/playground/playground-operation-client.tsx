'use client';

import {
  PromptInput,
  PromptInputToolbar,
  PromptInputTools,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';

import { cn } from '@deepcrawl/ui/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  usePlaygroundActionsSelector,
  usePlaygroundCoreSelector,
} from '@/hooks/playground/playground-context';
import type { DeepcrawlOperations } from '@/hooks/playground/types';
import { getOperationConfig } from '@/lib/playground/operations-config';
import { isPlausibleUrl } from '@/utils/playground/url-input-pre-validation';
import { PageContainer, PageTitle } from '../page-elements';
import { DetailedOptions } from './detailed-options';
import { DetailedOptionsAccordion } from './detailed-options-accordion';
import { OperationSelector } from './operation-selector';
import { PlaygroundOptionsMenusToolbar } from './playground-options-menus-toolbar';
import { PlaygroundUrlInput } from './playground-url-input';
import { PLAYGROUND_SECTION_ID, RESPONSE_SECTION_ID } from './scroll-anchors';
import { useScrollToAnchor } from './use-scroll-to-anchor';
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
export const PlaygroundOperationClientContent = ({
  className,
}: PlaygroundOperationClientContentProps) => {
  const [isError, setIsError] = useState(false);
  const [isDetailedBarOpen, setIsDetailedBarOpen] = useState(false);

  // Get state and actions from context
  const requestUrl = usePlaygroundCoreSelector('requestUrl');
  const selectedOperation = usePlaygroundCoreSelector('selectedOperation');
  const setRequestUrl = usePlaygroundActionsSelector('setRequestUrl');
  const executeApiCall = usePlaygroundActionsSelector('executeApiCall');
  const responses = usePlaygroundCoreSelector('responses');
  const response = responses[selectedOperation];
  const hasResponseData =
    response?.data !== undefined && response?.data !== null;
  const hasResponseReady = hasResponseData || Boolean(response?.error);

  const selectedOPConfig = getOperationConfig(selectedOperation);
  const isUrlValid = useMemo(() => {
    return Boolean(requestUrl && isPlausibleUrl(requestUrl));
  }, [requestUrl]);

  const scrollToAnchor = useScrollToAnchor();
  const hasAutoScrolledRef = useRef<Record<DeepcrawlOperations, boolean>>(
    {} as Record<DeepcrawlOperations, boolean>,
  );

  useEffect(() => {
    if (!(response && hasResponseReady)) {
      return;
    }

    if (hasAutoScrolledRef.current[selectedOperation]) {
      return;
    }

    hasAutoScrolledRef.current[selectedOperation] = true;
    scrollToAnchor(RESPONSE_SECTION_ID);
  }, [hasResponseReady, response, scrollToAnchor, selectedOperation]);

  const handleSubmit = () => {
    if (!isUrlValid) {
      setIsError(true);
      toast.error('Please enter a valid URL');
      return;
    }

    setIsError(false);
    executeApiCall(selectedOperation, selectedOPConfig.label);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequestUrl(e.target.value);
    if (isError) {
      setIsError(false);
    }
  };

  return (
    <PageContainer
      className={cn(
        'h-full',
        hasResponseData &&
          'min-h-[calc(100svh-theme(spacing.16))] group-data-[nav-mode=header]/header-nav-layout:min-h-[calc(100svh-theme(spacing.14)-theme(spacing.12))] sm:group-has-data-[collapsible=icon]/sidebar-wrapper:min-h-[calc(100svh-theme(spacing.12))]',
      )}
      id={PLAYGROUND_SECTION_ID}
    >
      <PageTitle
        className="mx-auto mt-28 mb-10 w-full text-center md:mt-[18svh]"
        description="API Playground for Deepcrawl"
        desPos="top"
        title="What would you like to see?"
        titleSize="3xl"
      />
      <div className="mx-auto flex w-full flex-col gap-4 sm:max-w-4/5">
        <PromptInput
          className={cn('relative w-full', className)}
          onSubmit={(_, event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          {/* Operation selector */}
          <PromptInputToolbar>
            <PromptInputTools className="w-full [&_button:first-child]:rounded-tl-lg [&_button:first-child]:rounded-bl-md">
              <OperationSelector hasResponseData={hasResponseData} />
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
      </div>
    </PageContainer>
  );
};
