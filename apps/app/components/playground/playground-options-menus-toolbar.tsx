import {
  PromptInputButton,
  PromptInputToolbar,
  PromptInputTools,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { cn } from '@deepcrawl/ui/lib/utils';
import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  usePlaygroundCore,
  usePlaygroundOptions,
} from '@/hooks/playground/playground-context';
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
  // Get state from context instead of props
  const { selectedOperation } = usePlaygroundCore();
  const { currentQueryState, getAnyOperationState } = usePlaygroundOptions();
  const { options: currentOpts, setOptions } = currentQueryState;

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
        {selectedOperation === 'extractLinks' && (
          <LinkExtractionOptionsMenu
            linkExtractionOptions={
              'linkExtractionOptions' in currentOpts
                ? currentOpts.linkExtractionOptions
                : undefined
            }
            onLinkExtractionOptionsChange={(linkExtractionOptions) =>
              setOptions({ linkExtractionOptions })
            }
          />
        )}

        {/* Markdown options - showing standalone for getMarkdown only */}
        <MarkdownOptionsMenu
          isMarkdownEnabled={selectedOperation === 'getMarkdown'}
          markdownOptions={
            'markdownConverterOptions' in currentOpts
              ? currentOpts.markdownConverterOptions
              : undefined
          }
          onMarkdownOptionsChange={(markdownConverterOptions) =>
            setOptions({ markdownConverterOptions })
          }
        />

        {/* Cleaning processor options */}
        <CleaningProcessorMenu
          onProcessorChange={(processor) =>
            setOptions({ cleaningProcessor: processor })
          }
          processor={
            'cleaningProcessor' in currentOpts
              ? currentOpts.cleaningProcessor
              : undefined
          }
        />

        {/* Cache options */}
        <CacheOptionsMenu
          cacheOptions={
            'cacheOptions' in currentOpts ? currentOpts.cacheOptions : undefined
          }
          onCacheOptionsChange={(cacheOptions) => setOptions({ cacheOptions })}
        />

        {/* Metrics options - only available for readUrl and extractLinks */}
        {(selectedOperation === 'readUrl' ||
          selectedOperation === 'extractLinks') && (
          <MetricsOptionsMenu
            metricsOptions={
              'metricsOptions' in currentOpts
                ? currentOpts.metricsOptions
                : undefined
            }
            onMetricsOptionsChange={(metricsOptions) =>
              setOptions({ metricsOptions })
            }
          />
        )}
      </PromptInputTools>

      <div className="flex items-center gap-x-0 overflow-hidden">
        <OptionPreviewBadges
          isAccordionOpen={isDetailedBarOpen}
          operation={selectedOperation}
          options={currentOpts}
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
