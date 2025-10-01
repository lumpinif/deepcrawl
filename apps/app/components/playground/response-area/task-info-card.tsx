import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Card, CardContent } from '@deepcrawl/ui/components/ui/card';
import { ScrollArea } from '@deepcrawl/ui/components/ui/scroll-area';
import { cn } from '@deepcrawl/ui/lib/utils';
import type { ExtractLinksResponse, ReadUrlResponse } from 'deepcrawl';
import {
  AlertTriangle,
  Clock,
  MessageCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import type { PlaygroundOperationResponse } from '@/hooks/playground/types';
import { formatTimestamp } from '@/utils/playground/formatter';
import { MetadataItem } from './page-metadata-card';

/**
 * MetricsDisplay component for showing timing metrics
 */
export function MetricsDisplay({
  className,
  formatTime,
  response,
  operationMethod,
  executionTime,
  apiMetrics,
  timestamp,
}: {
  className?: string;
  formatTime: (ms: number, asString?: boolean) => number | string;
  response: PlaygroundOperationResponse;
  operationMethod: string;
  executionTime?: number;
  timestamp?: string;
  apiMetrics?: ReadUrlResponse['metrics'] | ExtractLinksResponse['metrics'];
}) {
  const responseData =
    response.operation !== 'getMarkdown' ? response.data : undefined;

  return (
    <BentoDisplayCard className={className}>
      {timestamp && (
        <MetadataItem label="Timestamp" value={formatTimestamp(timestamp)} />
      )}
      {executionTime !== undefined && (
        <Badge className="flex items-center gap-1 text-xs" variant="secondary">
          <Clock className="h-3 w-3" />
          Frontend: {formatTime(executionTime, true)}
        </Badge>
      )}
      {apiMetrics?.readableDuration && (
        <Badge className="flex items-center gap-1 text-xs" variant="secondary">
          <Zap className="h-3 w-3" />
          API: {apiMetrics.readableDuration}
        </Badge>
      )}
      {/* Status and Method Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="text-xs" variant="outline">
          {operationMethod}
        </Badge>
        <Badge
          className="text-xs"
          variant={response.error ? 'destructive' : 'default'}
        >
          {response.status || 'Unknown'}
        </Badge>
        {response.errorType && (
          <Badge className="flex items-center gap-1 text-xs" variant="outline">
            {getErrorIcon(response.errorType)}
            {response.errorType}
          </Badge>
        )}
        {response.retryable && (
          <Badge className="text-xs" variant="outline">
            Retryable
          </Badge>
        )}
        {responseData?.cached && (
          <Badge className="text-xs" variant="secondary">
            Cached
          </Badge>
        )}
      </div>
    </BentoDisplayCard>
  );
}

/**
 * TitleDescriptionDisplay
 */
export function TitleDescriptionDisplay({
  className,
  title,
  description,
}: {
  className?: string;
  title?: string;
  description?: string;
}) {
  if (!(title || description)) {
    return null;
  }

  return (
    <BentoDisplayCard className={className}>
      <MetadataItem label="Title" value={title} />
      <MetadataItem
        icon={<MessageCircle className="h-3 w-3" />}
        label="Description"
        value={description}
      />
    </BentoDisplayCard>
  );
}

export function BentoDisplayCard({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className={cn(className, 'h-full overflow-hidden')}>
      <ScrollArea className="min-h-0">
        <CardContent>{children}</CardContent>
      </ScrollArea>
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
