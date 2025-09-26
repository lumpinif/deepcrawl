import {
  PromptInputButton,
  PromptInputToolbar,
  PromptInputTools,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { cn } from '@deepcrawl/ui/lib/utils';
import { Plus } from 'lucide-react';
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
  return (
    <PromptInputToolbar
      className="peer/toolbar group/toolbar border-b-0 hover:cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        setIsDetailedBarOpen(!isDetailedBarOpen);
      }}
    >
      <PromptInputTools className="gap-x-0">
        <AnimatePresence mode="wait">
          {isDetailedBarOpen && (
            <motion.span
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              className={cn(
                'mr-1 ml-3 select-none text-nowrap font-medium text-muted-foreground text-xs',
              )}
              exit={{ opacity: 0, x: -20, filter: 'blur(2px)' }}
              initial={{ opacity: 0, x: -20 }}
              key="customize-options"
              transition={{ duration: 0.15, ease: 'easeInOut' }}
            >
              Customize Options:
            </motion.span>
          )}
        </AnimatePresence>

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
      </PromptInputTools>

      <div className="flex items-center gap-x-0 overflow-hidden">
        <OptionPreviewBadges isAccordionOpen={isDetailedBarOpen} />
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
