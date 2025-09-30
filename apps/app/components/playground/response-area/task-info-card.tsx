import { Badge } from '@deepcrawl/ui/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import type { ExtractLinksResponse, ReadUrlResponse } from 'deepcrawl';
import {
  AlertTriangle,
  Calendar,
  Clock,
  ExternalLink,
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
  formatTime,
  executionTime,
  apiMetrics,
}: {
  formatTime: (ms: number, asString?: boolean) => number | string;
  executionTime?: number;
  apiMetrics?: ReadUrlResponse['metrics'] | ExtractLinksResponse['metrics'];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
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
    </div>
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

interface TaskInfoCardProps {
  response: PlaygroundOperationResponse;
  operationMethod: string;
  formatTime: (ms: number, asString?: boolean) => number | string;
}

/**
 * TaskInfoCard component for displaying request details and metrics
 */
export function TaskInfoCard({
  response,
  operationMethod,
  formatTime,
}: TaskInfoCardProps) {
  const responseData =
    response.operation !== 'getMarkdown' ? response.data : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Details</CardTitle>
        <CardDescription>
          Information about the API request and response
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
            <Badge
              className="flex items-center gap-1 text-xs"
              variant="outline"
            >
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

        {/* Metrics */}
        <MetricsDisplay
          apiMetrics={responseData?.metrics}
          executionTime={response.executionTime}
          formatTime={formatTime}
        />

        {/* Target URL and Timestamp */}
        <div className="grid gap-3 sm:grid-cols-2">
          {response.targetUrl && (
            <MetadataItem
              icon={<ExternalLink className="h-3 w-3" />}
              label="Target URL"
              value={response.targetUrl}
            />
          )}
          {response.timestamp && (
            <MetadataItem
              icon={<Calendar className="h-3 w-3" />}
              label="Timestamp"
              value={formatTimestamp(response.timestamp)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
