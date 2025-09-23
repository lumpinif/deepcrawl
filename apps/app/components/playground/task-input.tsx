'use client';

import {
  PromptInput,
  PromptInputBody,
  PromptInputToolbar,
  PromptInputTools,
} from '@deepcrawl/ui/components/ai-elements/prompt-input';
import { cn } from '@deepcrawl/ui/lib/utils';
import NumberFlow, { continuous } from '@number-flow/react';
import { Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTaskInputOperations } from '@/hooks/playground/use-task-input-operations';
import {
  type DeepcrawlOperations,
  useTaskInputState,
} from '@/hooks/playground/use-task-input-state';
import { getOperationConfig } from '@/lib/playground/operations-config';
import { isPlausibleUrl } from '@/utils/playground/url-input-pre-validation';
import { SpinnerButton } from '../spinner-button';
import { CacheOptionsMenu } from './cache-options-menu';
import { CleaningProcessorMenu } from './cleaning-processor-menu';
import { ContentFormatOptionsMenu } from './content-format-options-menu';
import { LinkExtractionOptionsMenu } from './link-extraction-options-menu';
import { MarkdownOptionsMenu } from './markdown-options-menu';
import { MetricsOptionsMenu } from './metrics-options-menu';
import { OperationSelector } from './operation-selector';
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

        <PromptInputToolbar>
          <PromptInputTools className="gap-x-0">
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
        </PromptInputToolbar>
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
