'use client';

import {
  IconHoverButton,
  IconHoverButtonIcon,
  IconHoverButtonText,
} from '@deepcrawl/ui/components/annui/icon-hover-button';
import { cn } from '@deepcrawl/ui/lib/utils';
import type {
  ExtractLinksResponse,
  GetMarkdownResponse,
  ReadUrlResponse,
} from 'deepcrawl';
import { ChevronUp, Share } from 'lucide-react';
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
import { MetricsDisplay, TitleDescriptionDisplay } from './task-info-card';

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
        'flex min-h-[calc(100svh-theme(spacing.16))] flex-col group-data-[nav-mode=header]/header-nav-layout:min-h-[calc(100svh-theme(spacing.12))] sm:group-has-data-[collapsible=icon]/sidebar-wrapper:min-h-[calc(100svh-theme(spacing.12))]',
      )}
      id={RESPONSE_SECTION_ID}
    >
      <PageHeader
        containerClassName="flex w-full items-center justify-between"
        description={selectedOPConfig.description}
        title={`${selectedOPConfig.label} Result - ${response.targetUrl}`}
      >
        <div className="flex items-center gap-2">
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
          baseContainerCN,
          'grid h-full gap-2 sm:gap-4 md:grid-cols-4',
          'pb-6 xl:pb-8 2xl:pb-10',
          className,
        )}
      >
        {/* Title */}
        <TitleDescriptionDisplay
          description={metadata?.description}
          title={metadata?.title}
        />

        {/* Main content */}
        <div
          className={cn(
            'md:col-span-3 md:h-full',
            !response.error && response.operation !== 'getMarkdown'
              ? 'md:row-span-3'
              : '',
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
              markdownContent={markdownContent}
              onRetry={onRetry}
              onTabChange={setActiveTab}
              response={response}
              selectedOperation={selectedOP}
              treeData={treeData}
            />
          )}
        </div>

        {/* Metrics */}
        <MetricsDisplay
          apiMetrics={metrics}
          executionTime={response.executionTime}
          formatTime={formatTime}
          operationMethod={operationMethod}
          response={response}
          timestamp={response.timestamp}
        />

        {/* Page Metadata Card */}
        <PageMetadataCard metadata={metadata} />
      </div>
    </div>
  );
}
