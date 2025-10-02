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
import type { ExtractLinksResponse, ReadUrlResponse } from 'deepcrawl';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useInView } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { PlaygroundOperationResponse } from '@/hooks/playground/types';
import { MetricsNumber } from '../metrics-number';
import { MetadataItem } from './page-metadata-card';

/**
 * MetricsDisplay component for showing timing metrics
 */
export function MetricsDisplay({
  className,
  formatTime,
  contentClassName,
  response,
  operationMethod,
  executionTime,
  apiMetrics,
  timestamp,
  badgeVariant = 'flex',
}: {
  className?: string;
  contentClassName?: string;
  formatTime: (ms: number, asString?: boolean) => number | string;
  response: PlaygroundOperationResponse;
  operationMethod: string;
  executionTime?: number;
  timestamp?: string;
  apiMetrics?: ReadUrlResponse['metrics'] | ExtractLinksResponse['metrics'];
  badgeVariant?: 'inline' | 'flex';
}) {
  const metricsRef = useRef<HTMLDivElement>(null);
  const [PGDuration, setPGDuration] = useState(0);
  const [APIDuration, setAPIDuration] = useState(0);
  const inView = useInView(metricsRef, { once: true });

  const playgroundDuration = executionTime ?? 0;
  const apiDuration = apiMetrics?.durationMs ?? 0;

  useEffect(() => {
    if (!inView) {
      return;
    }
    setTimeout(() => {
      setPGDuration(playgroundDuration);
      setAPIDuration(apiDuration ?? 0);
    }, 500);
  }, [inView, playgroundDuration, apiDuration]);

  const responseData =
    response.operation !== 'getMarkdown' ? response.data : undefined;

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
            {responseData?.cached && (
              <Badge
                className="select-none font-mono text-green-600 text-xs"
                variant="outline"
              >
                Cached
              </Badge>
            )}
          </div>
          {/* Metrics */}
          <div className="flex flex-col gap-0">
            {executionTime && (
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
            )}
            {apiMetrics?.durationMs && (
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
            )}
          </div>
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div className="flex cursor-default items-center justify-between gap-1 text-muted-foreground text-xs">
            <span>{format(timestamp, 'MMM d, yyyy h:mm a')}</span>
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
}

/**
 * DescriptionDisplay
 */
export function DescriptionDisplay({
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
}

export function BentoDisplayCard({
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
}

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
