import {
  PromptInputButton,
  PromptInputToolbar,
  PromptInputTools,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { cn } from '@deepcrawl/ui/lib/utils';
import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  DeepcrawlOperations,
  OperationQueryState,
  OperationToOptions,
} from '@/hooks/playground/types';
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
  selectedOperation: DeepcrawlOperations;
  currentQueryState: OperationQueryState<
    OperationToOptions[keyof OperationToOptions]
  >;
}

export function PlaygroundOptionsMenusToolbar({
  isDetailedBarOpen,
  setIsDetailedBarOpen,
  selectedOperation,
  currentQueryState,
}: PlaygroundOptionsMenusToolbarProps) {
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

        {/*
              SIMPLIFIED OPTION MENU PATTERN:
              All option menus now use currentState.setOptions() directly!
              The function auto-detects nested objects and merges them properly while
              handling direct properties with simple assignment.
            */}

        {/* Content format options */}
        <ContentFormatOptionsMenu
          contentFormatOptions={{
            metadata:
              'metadata' in currentOpts ? currentOpts.metadata : undefined,
            markdown:
              'markdown' in currentOpts
                ? currentOpts.markdown
                : selectedOperation === 'getMarkdown', // always true for getMarkdown
            cleanedHtml:
              'cleanedHtml' in currentOpts
                ? currentOpts.cleanedHtml
                : undefined,
            rawHtml: 'rawHtml' in currentOpts ? currentOpts.rawHtml : undefined,
            robots: 'robots' in currentOpts ? currentOpts.robots : undefined,
            tree: 'tree' in currentOpts ? currentOpts.tree : undefined,
            sitemapXML:
              'sitemapXML' in currentOpts ? currentOpts.sitemapXML : undefined,
          }}
          markdownOptions={
            'markdownConverterOptions' in currentOpts
              ? currentOpts.markdownConverterOptions
              : undefined
          }
          metadataOptions={
            'metadataOptions' in currentOpts
              ? currentOpts.metadataOptions
              : undefined
          }
          onContentFormatOptionsChange={(contentFormatOptions) =>
            setOptions(contentFormatOptions)
          }
          onMarkdownOptionsChange={(markdownConverterOptions) =>
            setOptions({ markdownConverterOptions })
          }
          onMetadataOptionsChange={(metadataOptions) =>
            setOptions({ metadataOptions })
          }
          onTreeOptionsChange={(treeOptions) => setOptions(treeOptions)}
          operation={selectedOperation}
          treeOptions={
            /* extractLinks options include folderFirst, so it narrows currentOpts to LinksOptions type */
            'folderFirst' in currentOpts && selectedOperation === 'extractLinks'
              ? {
                  folderFirst: currentOpts.folderFirst,
                  linksOrder: currentOpts.linksOrder,
                  extractedLinks: currentOpts.extractedLinks,
                  subdomainAsRootUrl: currentOpts.subdomainAsRootUrl,
                  isPlatformUrl: currentOpts.isPlatformUrl,
                }
              : undefined
          }
        />

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
