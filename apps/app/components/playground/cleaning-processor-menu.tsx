'use client';

import { DEFAULT_SCRAPE_OPTIONS } from '@deepcrawl/types/configs';
import {
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { CpuIcon } from '@deepcrawl/ui/components/icons/cpu';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { cn } from '@deepcrawl/ui/lib/utils';
import { Check } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { usePlaygroundOptionsSelector } from '@/contexts/playground-context';
import type { PlaygroundOptionsContextValue } from '@/hooks/playground/types';

const CLEANING_PROCESSOR_OPTIONS = [
  {
    value: 'cheerio-reader',
    label: 'Cheerio Reader',
    description: 'Default recommended processor for most websites',
  },
  {
    value: 'html-rewriter',
    label: 'HTML Rewriter',
    description: 'Deepcrawl custom processor, used for GitHub URLs',
  },
] as const;

export function CleaningProcessorMenu() {
  // Get state and actions from context
  const currentOpts = usePlaygroundOptionsSelector('currentOptions');
  const selectSetOptions = useCallback(
    (state: PlaygroundOptionsContextValue) =>
      state.currentQueryState.setOptions,
    [],
  );
  const setOptions = usePlaygroundOptionsSelector(selectSetOptions);

  // Extract processor from current options
  const processor =
    'cleaningProcessor' in currentOpts
      ? currentOpts.cleaningProcessor
      : undefined;

  // Create change handler that uses context
  const onProcessorChange = (
    cleaningProcessor: 'cheerio-reader' | 'html-rewriter',
  ) => {
    setOptions({ cleaningProcessor });
  };
  const iconRef = useRef<{
    startAnimation: () => void;
    stopAnimation: () => void;
  }>(null);
  const [isOpen, setIsOpen] = useState(false);
  const currentProcessor =
    processor || DEFAULT_SCRAPE_OPTIONS.cleaningProcessor;

  const defaultProcessor = DEFAULT_SCRAPE_OPTIONS.cleaningProcessor;

  const hasCustomSettings =
    processor !== DEFAULT_SCRAPE_OPTIONS.cleaningProcessor;

  const baseColor =
    'group-data-[customized=true]:text-sky-600 group-hover:!text-sky-600' as const;

  return (
    <Tooltip>
      <PromptInputActionMenu onOpenChange={setIsOpen} open={isOpen}>
        <TooltipTrigger asChild>
          <PromptInputActionMenuTrigger
            className="cursor-help"
            data-customized={hasCustomSettings ? 'true' : 'false'}
            data-state={isOpen ? 'open' : 'closed'}
            onMouseEnter={() => iconRef.current?.startAnimation()}
            onMouseLeave={() => iconRef.current?.stopAnimation()}
          >
            <CpuIcon className={cn(baseColor)} ref={iconRef} />
          </PromptInputActionMenuTrigger>
        </TooltipTrigger>
        <PromptInputActionMenuContent
          alignOffset={-4}
          className="w-fit overflow-visible p-0"
          onCloseAutoFocus={(e) => e.preventDefault()}
          sideOffset={10}
        >
          <div className="min-w-80 space-y-0.5 p-1">
            {CLEANING_PROCESSOR_OPTIONS.map((option) => (
              <button
                className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                key={option.value}
                onClick={() => onProcessorChange(option.value)}
                type="button"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-medium">
                    {option.label}
                    {option.value === defaultProcessor ? (
                      <Badge
                        className="text-muted-foreground text-xs uppercase"
                        variant="outline"
                      >
                        Default
                      </Badge>
                    ) : null}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {option.description}
                  </div>
                </div>
                {currentProcessor === option.value && (
                  <Check className="ml-2 h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t">
            <div className="p-2 pl-3">
              <p className="text-muted-foreground text-xs">
                * Different processors may yield different results
              </p>
            </div>
          </div>
        </PromptInputActionMenuContent>
        <TooltipContent align="start" side="bottom">
          <p>Choose the processor for cleaning HTML content</p>
        </TooltipContent>
      </PromptInputActionMenu>
    </Tooltip>
  );
}
