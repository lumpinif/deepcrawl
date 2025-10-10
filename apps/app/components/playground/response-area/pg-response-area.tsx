'use client';

import {
  IconHoverButton,
  IconHoverButtonIcon,
  IconHoverButtonText,
} from '@deepcrawl/ui/components/annui/icon-hover-button';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { cn } from '@deepcrawl/ui/lib/utils';
import type {
  ExtractLinksResponse,
  GetMarkdownResponse,
  ReadUrlResponse,
} from 'deepcrawl';
import { ChevronUp, ExternalLink, Share } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  usePlaygroundActionsSelector,
  usePlaygroundCoreSelector,
} from '@/contexts/playground-context';
import { getOperationConfig } from '@/lib/playground/operations-config';
import { RESPONSE_SECTION_ID } from '@/lib/playground/scroll-anchors';
import { copyToClipboard } from '@/utils/clipboard';
import { baseContainerCN, PageHeader } from '../../page-elements';
import { ContentTabs } from './content-tabs';
import { ErrorCard } from './error-card';
import { PageMetadataCard } from './page-metadata-card';
import { DescriptionDisplay, MetricsDisplay } from './task-info-card';

export interface PGResponseAreaProps {
  className?: string;
}

/**
 * Main component for displaying playground API response
 */
export function PGResponseArea({ className }: PGResponseAreaProps) {
  const selectedOP = usePlaygroundCoreSelector('selectedOperation');
  const responses = usePlaygroundCoreSelector('responses');
  const formatTime = usePlaygroundActionsSelector('formatTime');
  const handleRetry = usePlaygroundActionsSelector('handleRetry');

  const [activeTab, setActiveTab] = useState<'markdown' | 'tree' | 'raw'>(
    'markdown',
  );

  // Reset tab to appropriate default when switching operations
  useEffect(() => {
    if (selectedOP === 'readUrl' || selectedOP === 'getMarkdown') {
      setActiveTab('markdown');
    } else {
      setActiveTab('tree');
    }
  }, [selectedOP]);

  const selectedOPConfig = getOperationConfig(selectedOP);

  const handleShareUrl = async () => {
    const currentUrl = window.location.href;
    await copyToClipboard(currentUrl);
    toast.success('URL copied to clipboard');
  };

  const onRetry = () => {
    handleRetry(selectedOP, selectedOPConfig.label);
  };

  const operationMethod = selectedOPConfig.method;

  const response = responses[selectedOP];

  if (!response) {
    return null;
  }

  const getMarkdownResponseData =
    response.operation === 'getMarkdown'
      ? (response.data as GetMarkdownResponse)
      : undefined;

  const readUrlResponseData =
    response.operation === 'readUrl' &&
    response?.data !== undefined &&
    response?.data !== null
      ? (response.data as ReadUrlResponse)
      : undefined;

  const extractedLinksResponseData =
    response.operation === 'extractLinks' &&
    response?.data !== undefined &&
    response?.data !== null
      ? (response.data as ExtractLinksResponse)
      : undefined;

  const targetUrl =
    readUrlResponseData?.targetUrl ||
    extractedLinksResponseData?.targetUrl ||
    response.targetUrl ||
    '';

  const normalizedTargetUrl = normalizeUrl(targetUrl);

  const treeData =
    extractedLinksResponseData && 'tree' in extractedLinksResponseData
      ? extractedLinksResponseData.tree
      : undefined;

  const hasResponseData =
    Boolean(getMarkdownResponseData) ||
    Boolean(readUrlResponseData) ||
    Boolean(extractedLinksResponseData);

  const markdownContent =
    getMarkdownResponseData || readUrlResponseData?.markdown;

  const metadata = readUrlResponseData?.metadata || treeData?.metadata;

  const metrics =
    readUrlResponseData?.metrics || extractedLinksResponseData?.metrics;

  return (
    <div
      className={cn(
        '-scroll-mt-0.5',
        'flex flex-col',
        'lg:h-[calc(100svh-theme(spacing.16))] lg:group-data-[nav-mode=header]/header-nav-layout:h-[calc(100svh-theme(spacing.12))] lg:group-has-data-[collapsible=icon]/sidebar-wrapper:h-[calc(100svh-theme(spacing.12))]',
      )}
      id={RESPONSE_SECTION_ID}
    >
      {/* Response Area Header */}
      <PageHeader
        className="border-t"
        containerClassName="flex-col lg:flex-row flex w-full items-start lg:items-center lg:justify-between gap-y-4 lg:gap-y-0 gap-x-2"
        description={`${selectedOPConfig.description}`}
        label={
          <div className="flex w-full flex-wrap items-center gap-2">
            <Badge
              className="-translate-x-0.5 select-none text-muted-foreground text-sm hover:text-foreground"
              variant="outline"
            >
              {selectedOPConfig.label}
            </Badge>
            {response.operation !== 'getMarkdown' && (
              <a
                className="max-w-full cursor-pointer sm:max-w-md"
                href={targetUrl}
                rel="noopener"
                target="_blank"
              >
                <Badge
                  className="-translate-x-0.5 inline-flex select-none items-center gap-1 overflow-hidden text-ellipsis text-nowrap text-muted-foreground text-sm hover:text-foreground hover:underline"
                  variant="outline"
                >
                  <span className="truncate">{targetUrl}</span>{' '}
                  <ExternalLink className="mt-0.5 size-2 flex-shrink-0" />
                </Badge>
              </a>
            )}
          </div>
        }
        title={
          (selectedOP === 'getMarkdown' ? (
            <a
              className="flex cursor-pointer items-center gap-2 hover:underline"
              href={normalizedTargetUrl}
              rel="noopener"
              target="_blank"
            >
              <span className="break-words">{targetUrl}</span>
              <ExternalLink className="mt-1 hidden size-6 flex-shrink-0 md:flex" />
            </a>
          ) : (
            <span className="break-words">
              {metadata?.title ?? (targetUrl as string)}
            </span>
          )) as unknown as string
        }
        titleClassName="max-w-full lg:max-w-3xl xl:max-w-5xl"
      >
        <div className="flex items-center gap-2 max-lg:ml-auto">
          <IconHoverButton
            aria-label="Share"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleShareUrl}
            size="sm"
            type="button"
            variant="outline"
          >
            <IconHoverButtonIcon>
              <Share />
            </IconHoverButtonIcon>
            <IconHoverButtonText>Share</IconHoverButtonText>
          </IconHoverButton>

          <IconHoverButton
            aria-label="Scroll to top"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              const scrollContainer = document.querySelector(
                '[data-nav-mode] > div.overflow-y-auto, [data-radix-scroll-area-viewport]',
              );
              if (scrollContainer) {
                scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            <IconHoverButtonIcon>
              <ChevronUp />
            </IconHoverButtonIcon>
            <IconHoverButtonText>Back to playground</IconHoverButtonText>
          </IconHoverButton>
        </div>
      </PageHeader>

      {/* Main Response Area Bento Grid*/}
      <div
        className={cn(
          'size-full flex-1 max-sm:max-w-screen',
          'flex flex-col gap-4 max-lg:flex-col-reverse lg:flex-row',
          baseContainerCN,
          'md:overflow-hidden',
          'pb-6 xl:pb-8 2xl:pb-10',
          className,
        )}
      >
        {/* Main content */}
        <div
          className={cn(
            'size-full flex-1 lg:max-w-3/4',
            response.operation === 'getMarkdown' && '!max-w-full',
          )}
        >
          <ErrorCard
            activeTab={activeTab}
            onRetry={onRetry}
            response={response}
          />

          {!response.error && hasResponseData && (
            <ContentTabs
              activeTab={activeTab}
              apiMetrics={metrics}
              formatTime={formatTime}
              markdownContent={markdownContent}
              onRetry={onRetry}
              onTabChange={setActiveTab}
              operationMethod={operationMethod}
              response={response}
              selectedOperation={selectedOP}
              treeData={treeData}
            />
          )}
        </div>
        {/* Right Side Cards Container */}
        <div
          className={cn(
            'flex size-full flex-col gap-2 sm:gap-4 lg:max-w-1/4',
            response.operation === 'getMarkdown' && 'hidden',
          )}
        >
          {/* Metrics */}
          <MetricsDisplay
            apiMetrics={metrics}
            className="h-fit flex-none"
            formatTime={formatTime}
            operationMethod={operationMethod}
            response={response}
          />

          {response.operation === 'extractLinks' ? (
            <>
              <MetricsDisplay
                className="h-fit flex-none"
                operationMethod={operationMethod}
                response={response}
                variant="extractLinks"
              />
              <DescriptionDisplay
                className="!max-h-1/2 h-fit min-h-0"
                description={metadata?.description}
              />
            </>
          ) : (
            <DescriptionDisplay
              className="!max-h-1/2 h-fit min-h-0"
              description={metadata?.description}
            />
          )}

          {/* Page Metadata Card */}
          <PageMetadataCard
            className="max-h-2/3 min-h-0 w-full flex-1"
            metadata={metadata}
          />
        </div>
      </div>
    </div>
  );
}

function normalizeUrl(targetUrl: string) {
  try {
    if (targetUrl.startsWith('http')) {
      return new URL(targetUrl).toString();
    }

    return new URL(`https://${targetUrl}`).toString();
  } catch (error) {
    return targetUrl;
  }
}
