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
} from '@/hooks/playground/playground-context';
import { getOperationConfig } from '@/lib/playground/operations-config';
import { copyToClipboard } from '@/utils/clipboard';
import { baseContainerCN, PageHeader } from '../../page-elements';
import { PLAYGROUND_SECTION_ID, RESPONSE_SECTION_ID } from '../scroll-anchors';
import { useScrollToAnchor } from '../use-scroll-to-anchor';
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
  const scrollToAnchor = useScrollToAnchor();

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
        'md:h-[calc(100svh-theme(spacing.16))] md:group-data-[nav-mode=header]/header-nav-layout:h-[calc(100svh-theme(spacing.12))] md:group-has-data-[collapsible=icon]/sidebar-wrapper:h-[calc(100svh-theme(spacing.12))]',
      )}
      id={RESPONSE_SECTION_ID}
    >
      {/* Response Area Header */}
      <PageHeader
        className="border-t"
        containerClassName="flex-col md:flex-row flex w-full items-center md:justify-between gap-y-4 md:gap-y-0 gap-x-2"
        description={`${selectedOPConfig.description}`}
        label={
          <div className="flex items-center gap-2">
            <Badge
              className="-translate-x-0.5 select-none text-muted-foreground text-sm hover:text-foreground"
              variant="outline"
            >
              {selectedOPConfig.label}
            </Badge>
            {response.operation !== 'getMarkdown' && (
              <a
                className="max-w-md cursor-pointer"
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
              className="flex cursor-pointer items-center gap-2 overflow-hidden hover:underline md:max-w-lg lg:max-w-2xl 2xl:max-w-5xl"
              href={normalizedTargetUrl}
              rel="noopener"
              target="_blank"
            >
              <span className="text-wrap md:truncate">{targetUrl}</span>
              <ExternalLink className="mt-1 hidden size-6 flex-shrink-0 md:flex" />
            </a>
          ) : (
            <span className="text-wrap md:truncate">
              {metadata?.title ?? (targetUrl as string)}
            </span>
          )) as unknown as string
        }
      >
        <div className="flex items-center gap-2 max-md:ml-auto">
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
            aria-label="Scroll to playground"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => scrollToAnchor(PLAYGROUND_SECTION_ID)}
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
          'size-full flex-1',
          'flex flex-col gap-2 max-md:flex-col-reverse sm:gap-4 md:flex-row',
          baseContainerCN,
          'md:overflow-hidden',
          'pb-6 xl:pb-8 2xl:pb-10',
          className,
        )}
      >
        {/* Main content */}
        <div
          className={cn(
            'size-full flex-1 md:max-w-3/4',
            response.operation === 'getMarkdown' && '!max-w-full',
          )}
        >
          {/* Error State */}
          <ErrorCard
            activeTab={activeTab}
            onRetry={onRetry}
            response={response}
          />

          {/* Success State - Content Cards with Tabs */}
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
            'flex size-full flex-col gap-2 sm:gap-4 md:max-w-1/4',
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
