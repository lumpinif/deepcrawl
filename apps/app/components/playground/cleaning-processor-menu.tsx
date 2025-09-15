'use client';

import { DEFAULT_SCRAPE_OPTIONS } from '@deepcrawl/types/configs';
import {
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { CpuIcon } from '@deepcrawl/ui/components/icons/cpu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { Check } from 'lucide-react';

interface CleaningProcessorMenuProps {
  processor: string | undefined;
  onProcessorChange: (processor: 'cheerio-reader' | 'html-rewriter') => void;
}

const PROCESSOR_OPTIONS = [
  {
    value: 'cheerio-reader',
    label: 'Cheerio Reader',
    description: 'Default recommended processor for most websites',
  },
  {
    value: 'html-rewriter',
    label: 'HTML Rewriter',
    description: 'Cloudflare-native processor, used for GitHub URLs',
  },
] as const;

export function CleaningProcessorMenu({
  processor,
  onProcessorChange,
}: CleaningProcessorMenuProps) {
  const currentProcessor =
    processor || DEFAULT_SCRAPE_OPTIONS.cleaningProcessor;

  return (
    <Tooltip>
      <PromptInputActionMenu>
        <TooltipTrigger asChild>
          <PromptInputActionMenuTrigger className="cursor-help">
            <CpuIcon />
          </PromptInputActionMenuTrigger>
        </TooltipTrigger>
        <PromptInputActionMenuContent
          alignOffset={-4}
          className="w-fit overflow-visible p-0"
          sideOffset={10}
        >
          <div className="min-w-80 space-y-0.5 p-1">
            {PROCESSOR_OPTIONS.map((option) => (
              <button
                className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none"
                key={option.value}
                onClick={() => onProcessorChange(option.value)}
                type="button"
              >
                <div className="space-y-0.5">
                  <div className="font-medium">{option.label}</div>
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
        <TooltipContent side="right">
          <p>Choose the processor for cleaning HTML content</p>
        </TooltipContent>
      </PromptInputActionMenu>
    </Tooltip>
  );
}
