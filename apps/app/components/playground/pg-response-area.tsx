import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { cn } from '@deepcrawl/ui/lib/utils';
import { AlertTriangle, Copy, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { SpinnerButton } from '@/components/spinner-button';
import { usePlaygroundActions } from '@/hooks/playground/playground-context';
import type {
  DeepcrawlOperations,
  PlaygroundResponse,
} from '@/hooks/playground/types';
import { copyToClipboard } from '@/utils/clipboard';

interface PGResponseArea {
  response: PlaygroundResponse;
  operation: DeepcrawlOperations;
  operationLabel?: string;
  operationMethod: string;
  onRetry: () => void;
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

const getErrorColor = (errorType?: string) => {
  switch (errorType) {
    case 'rateLimit':
      return 'border-orange-500/50 bg-orange-500/5';
    case 'network':
      return 'border-blue-500/50 bg-blue-500/5';
    case 'auth':
      return 'border-red-500/50 bg-red-500/5';
    case 'validation':
      return 'border-yellow-500/50 bg-yellow-500/5';
    default:
      return 'border-destructive/50 bg-destructive/5';
  }
};

const formatResponseData = (data: unknown): string => {
  return JSON.stringify(data, null, 2);
};

export function PGResponseArea({
  response,
  operation,
  operationMethod,
  onRetry,
}: PGResponseArea) {
  // Get formatTime from context instead of props
  const { formatTime } = usePlaygroundActions();
  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-3">
      {/* Response Header */}
      <div className="flex items-center justify-between overflow-x-auto max-sm:flex-col max-sm:items-start max-sm:gap-3">
        <div className="flex items-center gap-2">
          <Badge className="text-xs" variant="outline">
            {operationMethod}
          </Badge>
          <span className="font-medium text-sm">Response</span>
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
          {response.executionTime && (
            <Badge className="text-xs" variant="secondary">
              {formatTime(response.executionTime, true)}
            </Badge>
          )}
          {response.retryable && (
            <Badge className="text-xs" variant="outline">
              Retryable
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 max-sm:w-full max-sm:flex-row-reverse max-sm:justify-between">
          <SpinnerButton
            className="max-sm:flex-1"
            onClick={() =>
              handleCopy(
                response.error
                  ? response.error
                  : formatResponseData(response.data),
              )
            }
            size="sm"
            variant="outline"
          >
            <Copy className="h-4 w-4" />
            Copy
          </SpinnerButton>
          {response.retryable && (
            <SpinnerButton
              className="max-sm:flex-1"
              onClick={onRetry}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </SpinnerButton>
          )}
        </div>
      </div>

      {/* Response Content */}
      <div
        className={cn(
          'relative rounded-lg border p-4 text-sm lg:p-6',
          'max-h-[calc(100svh-20rem)] overflow-auto',
          response.error ? getErrorColor(response.errorType) : 'bg-muted/50',
        )}
      >
        {response.error ? (
          <div className="space-y-2">
            {response.userMessage &&
              response.userMessage !== response.error && (
                <div className="font-medium text-sm">
                  {response.userMessage}
                </div>
              )}
            <pre className="whitespace-pre-wrap font-mono text-xs opacity-75">
              {response.error}
            </pre>
            {response.targetUrl && (
              <div className="text-muted-foreground text-xs">
                invalid input: {response.targetUrl}
              </div>
            )}
            {response.retryAfter && (
              <div className="text-orange-600 text-xs">
                Retry after: {response.retryAfter} seconds
              </div>
            )}
          </div>
        ) : operation === 'getMarkdown' && typeof response.data === 'string' ? (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:border prose-table:border prose-td:border prose-th:border prose-blockquote:border-muted-foreground prose-blockquote:border-l-4 prose-pre:bg-muted prose-th:bg-muted prose-blockquote:pl-4 prose-headings:font-semibold prose-a:text-primary prose-code:text-foreground prose-headings:text-foreground prose-li:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:no-underline hover:prose-a:underline">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {response.data}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap font-mono">
            {formatResponseData(response.data)}
          </pre>
        )}
      </div>
    </div>
  );
}
