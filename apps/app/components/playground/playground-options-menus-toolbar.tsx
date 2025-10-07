import {
  PromptInputButton,
  PromptInputToolbar,
  PromptInputTools,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { cn } from '@deepcrawl/ui/lib/utils';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { CacheOptionsMenu } from './cache-options-menu';
import { CleaningProcessorMenu } from './cleaning-processor-menu';
import { ContentFormatOptionsMenu } from './content-format-options-menu';
import { LinkExtractionOptionsMenu } from './link-extraction-options-menu';
import { MarkdownOptionsMenu } from './markdown-options-menu';
import { MetricsOptionsMenu } from './metrics-options-menu';
import { OptionPreviewBadges } from './option-preview-badges';

interface PlaygroundOptionsMenusToolbarProps {
  isDetailedBarOpen: boolean;
  setIsDetailedBarOpen: (isDetailedBarOpen: boolean) => void;
}

export function PlaygroundOptionsMenusToolbar({
  isDetailedBarOpen,
  setIsDetailedBarOpen,
}: PlaygroundOptionsMenusToolbarProps) {
  const customizeLabelClasses = cn(
    'mr-1 flex w-fit select-none items-center overflow-hidden text-nowrap font-medium text-muted-foreground text-xs transition-all duration-250 ease-out',
    isDetailedBarOpen
      ? 'ml-3 max-w-[12rem] translate-x-0 opacity-100'
      : '-translate-x-1 pointer-events-none ml-0 max-w-0 opacity-0 blur-[3px]',
  );

  return (
    <PromptInputToolbar
      className="peer/toolbar group/toolbar border-b-0 hover:cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        setIsDetailedBarOpen(!isDetailedBarOpen);
      }}
    >
      <PromptInputTools className="items-center gap-x-0 max-sm:flex-col max-sm:items-start max-sm:py-2">
        <div className={customizeLabelClasses}>
          <AnimatePresence mode="wait">
            {isDetailedBarOpen && (
              <motion.span
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                className="flex w-fit select-none items-center gap-x-1"
                exit={{ opacity: 0, x: -15, filter: 'blur(4px)' }}
                initial={{ opacity: 0, x: -10, filter: 'blur(6px)' }}
                key="customize-options"
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                Customize Options{' '}
                <motion.span
                  animate={{ rotate: 360 }}
                  className="shrink-0 select-none"
                  exit={{ rotate: -180 }}
                  initial={{ rotate: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <ChevronRight className="size-3 shrink-0 select-none max-sm:hidden" />
                  <ChevronDown className="size-3 shrink-0 select-none" />
                </motion.span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="">
          {/* Content format options */}
          <ContentFormatOptionsMenu />

          {/* Link extraction options - only available for extractLinks */}
          <LinkExtractionOptionsMenu />

          {/* Markdown options - showing standalone for getMarkdown only */}
          <MarkdownOptionsMenu />

          {/* Cleaning processor options */}
          <CleaningProcessorMenu />

          {/* Cache options */}
          <CacheOptionsMenu />

          {/* Metrics options - only available for readUrl and extractLinks */}
          <MetricsOptionsMenu />
        </div>
      </PromptInputTools>

      <div className="flex items-center gap-x-0 overflow-hidden">
        <OptionPreviewBadges
          className="max-sm:hidden"
          isAccordionOpen={isDetailedBarOpen}
        />
        {/* Detailed options toggle button */}
        <PromptInputButton
          className="cursor-pointer transition-all [&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&[data-state=open]>svg>path:last-child]:rotate-90 [&[data-state=open]>svg>path:last-child]:opacity-0 [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg]:text-primary"
          data-state={isDetailedBarOpen ? 'open' : 'closed'}
          onClick={() => setIsDetailedBarOpen(!isDetailedBarOpen)}
          type="button"
        >
          <Plus
            className="size-4 shrink-0 transition-transform duration-200 group-hover/toolbar:rotate-90 group-hover/toolbar:text-primary"
            strokeWidth={1}
          />
        </PromptInputButton>
      </div>
    </PromptInputToolbar>
  );
}
