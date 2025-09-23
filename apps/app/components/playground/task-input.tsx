'use client';

import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputToolbar,
  PromptInputTools,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { cn } from '@deepcrawl/ui/lib/utils';
import NumberFlow, { continuous } from '@number-flow/react';
import { Plus, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTaskInputOperations } from '@/hooks/playground/use-task-input-operations';
import {
  type DeepcrawlOperations,
  type GetCurrentOptionValue,
  useTaskInputState,
} from '@/hooks/playground/use-task-input-state';
import { getOperationConfig } from '@/lib/playground/operations-config';
import { isPlausibleUrl } from '@/utils/playground/url-input-pre-validation';
import { SpinnerButton } from '../spinner-button';
import { CacheOptionsMenu } from './cache-options-menu';
import { CleaningProcessorMenu } from './cleaning-processor-menu';
import { ContentFormatOptionsMenu } from './content-format-options-menu';
import { DetailedOptions } from './detailed-options';
import { DetailedOptionsAccordion } from './detailed-options-accordion';
import { LinkExtractionOptionsMenu } from './link-extraction-options-menu';
import { MarkdownOptionsMenu } from './markdown-options-menu';
import { MetricsOptionsMenu } from './metrics-options-menu';
import { OperationSelector } from './operation-selector';
import { OptionPreviewBadges } from './option-preview-badges';
import { PGResponseArea } from './pg-response-area';
import { UrlInput } from './url-input';

// TODO: SOCIAL: FEATURE IDEA: add workflow automation allowing auto-configure based on detected url input, for example, if url includes 'github.com' we can use optimized configs for that, by using our smart handleOptionsChange generic function

// TODO: VALIDATE ALL TOOLTIPS AND DESCRIPTIONS FOR ALL OPTIONS

export interface TaskInputProps {
  defaultOperation?: DeepcrawlOperations;
  defaultUrl?: string;
}

export const TaskInput = ({
  defaultOperation = 'getMarkdown',
  defaultUrl = '',
}: TaskInputProps) => {
  const [isError, setIsError] = useState(false);
  const [isDetailedBarOpen, setIsDetailedBarOpen] = useState(false);

  // Use custom hooks for state management
  const {
    requestUrl,
    selectedOperation,
    isLoading,
    responses,
    options,
    activeRequestsRef,
    setRequestUrl,
    setSelectedOperation,
    setIsLoading,
    setResponses,
    getCurrentOptionValue,
    handleOptionsChange,
    getCurrentOptions,
    resetToDefaults,
  } = useTaskInputState({ defaultOperation, defaultUrl });

  // Use custom hook for API operations
  const { executeApiCall, handleRetry, formatTime, getCurrentExecutionTime } =
    useTaskInputOperations({
      requestUrl,
      options,
      activeRequestsRef,
      setIsLoading,
      setResponses,
    });

  // Get current operation config
  const selectedOPConfig = getOperationConfig(selectedOperation);

  // Bridge function to make the strictly-typed hook function compatible with component interfaces
  // This allows components to access both operation keys and additional keys like 'cacheOptions', 'treeOptions', etc.
  const getOptionValue: GetCurrentOptionValue = <Key extends string>(
    key: Key,
    fallback?: unknown,
  ) => {
    // Type-safe casting: the hook function accepts the same parameter types at runtime
    type HookKey = Parameters<typeof getCurrentOptionValue>[0];
    type HookFallback = Parameters<typeof getCurrentOptionValue>[1];

    return getCurrentOptionValue(key as HookKey, fallback as HookFallback);
  };

  // Memoize URL validation to prevent re-renders
  const isUrlValid = useMemo(() => {
    return requestUrl && isPlausibleUrl(requestUrl);
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
        className="relative mx-auto mt-4 sm:max-w-2/3"
        onSubmit={(_, event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <PromptInputToolbar>
          <PromptInputTools className="[&_button:first-child]:rounded-tl-lg [&_button:first-child]:rounded-bl-md">
            <OperationSelector
              isLoading={isLoading[selectedOperation]}
              onOperationChange={setSelectedOperation}
              selectedOperation={selectedOperation}
            />
          </PromptInputTools>
        </PromptInputToolbar>

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
              isLoading[selectedOperation]
                ? 'loading'
                : isError
                  ? 'error'
                  : 'idle'
            }
            buttonVariant="default"
            className="group/spinner-button mr-2 w-32"
            data-loading={isLoading[selectedOperation]}
            disabled={isError || !isUrlValid || isLoading[selectedOperation]}
            errorElement={<span>Try again</span>}
            isLoading={isLoading[selectedOperation]}
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
                  getCurrentExecutionTime(selectedOperation) > 1000
                    ? ' s'
                    : ' ms'
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
              All option menus now use handleOptionsChange() directly!
              The function auto-detects nested objects and merges them properly while
              handling direct properties with simple assignment.
            */}

            {/* Content format options */}
            <ContentFormatOptionsMenu
              contentFormatOptions={{
                // ReadUrl options
                metadata: getCurrentOptionValue('metadata') as boolean,
                markdown: getCurrentOptionValue('markdown') as boolean,
                cleanedHtml: getCurrentOptionValue('cleanedHtml') as boolean,
                rawHtml: getCurrentOptionValue('rawHtml') as boolean,
                robots: getCurrentOptionValue('robots') as boolean,
                // ExtractLinks options
                tree: getCurrentOptionValue('tree') as boolean,
                sitemapXML: getCurrentOptionValue('sitemapXML') as boolean,
              }}
              markdownOptions={getCurrentOptionValue(
                'markdownConverterOptions',
              )}
              metadataOptions={getCurrentOptionValue('metadataOptions')}
              onContentFormatOptionsChange={(contentFormatOptions) =>
                handleOptionsChange(contentFormatOptions)
              }
              onMarkdownOptionsChange={(markdownConverterOptions) =>
                handleOptionsChange({ markdownConverterOptions })
              }
              onMetadataOptionsChange={(metadataOptions) =>
                handleOptionsChange({ metadataOptions })
              }
              onTreeOptionsChange={(treeOptions) =>
                handleOptionsChange(treeOptions)
              }
              operation={selectedOperation}
              treeOptions={{
                folderFirst: getCurrentOptionValue('folderFirst') as boolean,
                linksOrder: getCurrentOptionValue('linksOrder') as
                  | 'page'
                  | 'alphabetical',
                extractedLinks: getCurrentOptionValue(
                  'extractedLinks',
                ) as boolean,
                subdomainAsRootUrl: getCurrentOptionValue(
                  'subdomainAsRootUrl',
                ) as boolean,
                isPlatformUrl: getCurrentOptionValue(
                  'isPlatformUrl',
                ) as boolean,
              }}
            />

            {/* Link extraction options - only available for extractLinks */}
            {selectedOperation === 'extractLinks' && (
              <LinkExtractionOptionsMenu
                linkExtractionOptions={getCurrentOptionValue(
                  'linkExtractionOptions',
                )}
                onLinkExtractionOptionsChange={(linkExtractionOptions) =>
                  handleOptionsChange({ linkExtractionOptions })
                }
              />
            )}

            {/* Markdown options - showing standalone for getMarkdown only */}
            <MarkdownOptionsMenu
              isMarkdownEnabled={selectedOperation === 'getMarkdown'}
              markdownOptions={getCurrentOptionValue(
                'markdownConverterOptions',
              )}
              onMarkdownOptionsChange={(markdownConverterOptions) =>
                handleOptionsChange({ markdownConverterOptions })
              }
            />

            {/* Cleaning processor options */}
            <CleaningProcessorMenu
              onProcessorChange={(processor) =>
                handleOptionsChange({ cleaningProcessor: processor })
              }
              processor={getCurrentOptionValue('cleaningProcessor')}
            />

            {/* Cache options */}
            <CacheOptionsMenu
              cacheOptions={getCurrentOptionValue('cacheOptions')}
              onCacheOptionsChange={(cacheOptions) =>
                handleOptionsChange({ cacheOptions })
              }
            />

            {/* Metrics options - only available for readUrl and extractLinks */}
            {(selectedOperation === 'readUrl' ||
              selectedOperation === 'extractLinks') && (
              <MetricsOptionsMenu
                metricsOptions={getCurrentOptionValue('metricsOptions')}
                onMetricsOptionsChange={(metricsOptions) =>
                  handleOptionsChange({ metricsOptions })
                }
              />
            )}
          </PromptInputTools>

          <div className="flex items-center gap-x-0 overflow-hidden">
            <OptionPreviewBadges
              getCurrentOptionValue={getOptionValue}
              isAccordionOpen={isDetailedBarOpen}
              operation={selectedOperation}
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

        {/* detailed options accordion */}
        <DetailedOptionsAccordion
          childrenProps={{ className: 'p-4' }}
          open={isDetailedBarOpen}
        >
          <DetailedOptions
            getCurrentOptions={getCurrentOptions}
            getCurrentOptionValue={getOptionValue}
            operation={selectedOperation}
            requestUrl={requestUrl}
            resetToDefaults={resetToDefaults}
          />
        </DetailedOptionsAccordion>
      </PromptInput>

      {/* Results Section */}
      {responses[selectedOperation] && (
        <div className="mt-6 space-y-3">
          <PGResponseArea
            formatTime={formatTime}
            onRetry={() => {
              handleRetry(selectedOperation, selectedOPConfig.label);
            }}
            operation={selectedOperation}
            operationLabel={selectedOPConfig.label}
            operationMethod={selectedOPConfig.method}
            response={responses[selectedOperation]}
          />
        </div>
      )}
    </>
  );
};
