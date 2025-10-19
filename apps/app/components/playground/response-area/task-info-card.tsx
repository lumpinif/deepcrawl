import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Card, CardContent } from '@deepcrawl/ui/components/ui/card';
import { ScrollArea } from '@deepcrawl/ui/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@deepcrawl/ui/components/ui/tooltip';
import { cn } from '@deepcrawl/ui/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import type { ExtractLinksResponse, ReadUrlResponse } from 'deepcrawl/types';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useInView } from 'motion/react';
import { memo, useEffect, useRef, useState } from 'react';
import type {
  PlaygroundActions,
  PlaygroundOperationResponse,
} from '@/hooks/playground/types';
import { MetricsNumber } from '../metrics-number';
import { MetadataItem } from './page-metadata-card';

/**
 * MetricsDisplay component for showing timing metrics
 */
export const MetricsDisplay = memo(function MetricsDisplay({
  className,
  formatTime,
  contentClassName,
  response,
  operationMethod,
  apiMetrics,
  badgeVariant = 'flex',
  variant = 'default',
  enableTooltip = true,
}: {
  className?: string;
  contentClassName?: string;
  formatTime?: PlaygroundActions['formatTime'];
  response: PlaygroundOperationResponse;
  operationMethod: string;
  apiMetrics?: ReadUrlResponse['metrics'] | ExtractLinksResponse['metrics'];
  badgeVariant?: 'inline' | 'flex';
  variant?: 'default' | 'extractLinks';
  enableTooltip?: boolean;
}) {
  const metricsRef = useRef<HTMLDivElement>(null);
  const [PGDuration, setPGDuration] = useState(0);
  const [APIDuration, setAPIDuration] = useState(0);
  const [totalUrls, setTotalUrls] = useState(0);

  const inView = useInView(metricsRef, { once: true });

  const playgroundDuration = response.executionTime ?? 0;
  const apiDuration = apiMetrics?.durationMs ?? 0;
  const timestamp = response.timestamp ?? '';

  const isGetMarkdownResponse = response.operation === 'getMarkdown';

  const responseData = isGetMarkdownResponse ? undefined : response.data;
  const isExtractLinksResponse = response.operation === 'extractLinks';
  const treeData =
    responseData && 'tree' in responseData ? responseData.tree : undefined;

  useEffect(() => {
    if (!inView) {
      return;
    }
    setTimeout(() => {
      setPGDuration(playgroundDuration);
      setAPIDuration(apiDuration ?? 0);
    }, 500);
  }, [inView, playgroundDuration, apiDuration]);

  useEffect(() => {
    if (!(inView || isExtractLinksResponse)) {
      return;
    }
    setTimeout(() => {
      setTotalUrls(treeData?.totalUrls ?? 0);
    }, 500);
  }, [inView, treeData, isExtractLinksResponse]);

  if (variant === 'extractLinks' && isExtractLinksResponse && responseData) {
    const rootUrl = treeData?.url;
    const lastUpdated = treeData?.lastUpdated;

    const rootUrlContent = (
      <div
        className={cn(
          'group flex items-center justify-between gap-1 text-nowrap',
          badgeVariant === 'inline' && 'gap-2',
        )}
      >
        <span className="pointer-events-none text-muted-foreground text-xs group-hover:text-foreground">
          Root URL
        </span>
        <span className="truncate break-words font-medium text-muted-foreground text-sm group-hover:text-foreground">
          {rootUrl}
        </span>
      </div>
    );

    const totalUrlsContent = (
      <div className="group flex items-center justify-between gap-1 text-nowrap">
        <span className="pointer-events-none text-muted-foreground text-xs group-hover:text-foreground">
          Total URLs Extracted
        </span>
        <MetricsNumber
          className="font-semibold text-2xl group-hover:text-foreground"
          options={{
            suffix: undefined,
            format: undefined,
          }}
          value={totalUrls}
        />
      </div>
    );

    return (
      <Card className={cn(className)} ref={metricsRef}>
        <CardContent className={cn('flex flex-col gap-2', contentClassName)}>
          <div
            className={cn(
              badgeVariant === 'flex'
                ? 'flex flex-col gap-2'
                : 'inline-flex items-center justify-between gap-2',
            )}
          >
            <div className="flex flex-col gap-2">
              {rootUrl &&
                (enableTooltip ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{rootUrlContent}</TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Root URL of the request url</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  rootUrlContent
                ))}

              {enableTooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>{totalUrlsContent}</TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Total URLs extracted from the url</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                totalUrlsContent
              )}
            </div>
          </div>

          {/* Timestamp */}
          {lastUpdated && (
            <div
              className="flex cursor-default items-center justify-between gap-1 text-muted-foreground text-xs"
              title={format(lastUpdated, 'MMM d, yyyy h:mm a')}
            >
              <span>Last Updated</span>
              <span>{format(lastUpdated, 'MMM d, yyyy H:mm:ss.SSS')}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)} ref={metricsRef}>
      <CardContent className={cn('flex flex-col gap-2', contentClassName)}>
        <div
          className={cn(
            badgeVariant === 'flex'
              ? 'flex flex-col gap-2'
              : 'inline-flex items-center justify-between gap-2',
          )}
        >
          <div
            className={cn(
              badgeVariant === 'flex'
                ? 'flex w-full items-center justify-evenly gap-2 [&:not(:has(>:nth-child(3):last-child))]:justify-between'
                : 'inline-flex items-center gap-2',
            )}
          >
            {/* Method and Status */}
            <div className="flex items-center gap-2">
              <Badge
                className="select-none font-mono text-muted-foreground text-xs [&[data-method='DELETE']]:text-red-600 [&[data-method='GET']]:text-green-600 [&[data-method='POST']]:text-blue-600 [&[data-method='PUT']]:text-yellow-600"
                data-method={operationMethod}
                variant="outline"
              >
                {operationMethod}
              </Badge>
              <Badge
                className="select-none font-mono text-muted-foreground text-xs [&[data-status^='2']]:text-green-600 [&[data-status^='4']]:text-yellow-600 [&[data-status^='5']]:text-red-600"
                data-status={response.status || 'unknown'}
                variant="outline"
              >
                {response.status || 'Unknown'}
              </Badge>
            </div>
            {/* Error Type */}
            {response.errorType && (
              <Badge
                className="flex items-center gap-1 text-muted-foreground text-xs"
                title={response.errorType}
                variant="destructive"
              >
                {getErrorIcon(response.errorType)}
                {/* {response.errorType} */}links
              </Badge>
            )}
            {/* Cached */}
            {responseData?.cached ? (
              <Badge
                className="select-none font-mono text-green-600 text-xs"
                variant="outline"
              >
                Cached
              </Badge>
            ) : (
              <Badge
                className="select-none font-mono text-green-600 text-xs"
                variant="outline"
              >
                Not Cached
              </Badge>
            )}
          </div>
          {/* Metrics */}
          <div className="flex flex-col gap-0">
            {enableTooltip ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'group flex items-center justify-between gap-1 text-nowrap',
                      badgeVariant === 'inline' && 'gap-2',
                    )}
                  >
                    <span className="pointer-events-none text-muted-foreground text-xs group-hover:text-foreground">
                      Current Playground
                    </span>
                    <MetricsNumber
                      className="font-medium text-muted-foreground text-sm group-hover:text-foreground"
                      formatTime={formatTime}
                      value={PGDuration}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Time taken of playground execution</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div
                className={cn(
                  'group flex items-center justify-between gap-1 text-nowrap',
                  badgeVariant === 'inline' && 'gap-2',
                )}
              >
                <span className="pointer-events-none text-muted-foreground text-xs group-hover:text-foreground">
                  Current Playground
                </span>
                <MetricsNumber
                  className="font-medium text-muted-foreground text-sm group-hover:text-foreground"
                  formatTime={formatTime}
                  value={PGDuration}
                />
              </div>
            )}
            {!isGetMarkdownResponse &&
              (enableTooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="group flex items-center justify-between gap-1 text-nowrap">
                      <span className="pointer-events-none text-muted-foreground text-xs group-hover:text-foreground">
                        API Response
                      </span>
                      <MetricsNumber
                        className="font-semibold text-2xl group-hover:text-foreground"
                        formatTime={formatTime}
                        value={APIDuration}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Time taken of Real API execution</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div className="group flex items-center justify-between gap-1 text-nowrap">
                  <span className="pointer-events-none text-muted-foreground text-xs group-hover:text-foreground">
                    API Response
                  </span>
                  <MetricsNumber
                    className="font-semibold text-2xl group-hover:text-foreground"
                    formatTime={formatTime}
                    value={APIDuration}
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div className="flex cursor-default items-center justify-between gap-1 text-muted-foreground text-xs">
            <span>{format(timestamp, 'MMM d, yyyy H:mm:ss')}</span>
            <span>
              {formatDistanceToNow(timestamp, {
                includeSeconds: true,
                addSuffix: true,
              })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

/**
 * DescriptionDisplay
 */
export const DescriptionDisplay = memo(function DescriptionDisplay({
  className,
  description,
}: {
  className?: string;
  description?: string;
}) {
  if (!description) {
    return null;
  }

  return (
    <BentoDisplayCard className={className}>
      <MetadataItem label="Description" value={description} />
    </BentoDisplayCard>
  );
});

export const BentoDisplayCard = memo(function BentoDisplayCard({
  className,
  contentClassName,
  children,
  ref,
}: {
  className?: string;
  contentClassName?: string;
  children?: React.ReactNode;
  ref?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <Card className={cn(className)} ref={ref}>
      <CardContent className={cn('overflow-hidden', contentClassName)}>
        <ScrollArea className="size-full min-h-0">{children}</ScrollArea>
      </CardContent>
    </Card>
  );
});

const getErrorIcon = (errorType?: string) => {
  switch (errorType) {
    case 'rateLimit':
      return <RefreshCw className="h-4 w-4" />;
    case 'network':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
};
