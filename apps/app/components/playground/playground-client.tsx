'use client';

import type { LinkIconHandle } from '@deepcrawl/ui/components/icons/link';
import { LinkIcon } from '@deepcrawl/ui/components/icons/link';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@deepcrawl/ui/components/ui/card';
import { Input } from '@deepcrawl/ui/components/ui/input';
import { Label } from '@deepcrawl/ui/components/ui/label';
import { cn } from '@deepcrawl/ui/lib/utils';
import {
  DeepcrawlApp,
  type ExtractLinksOutput,
  type GetMarkdownOutput,
  type ReadUrlOutput,
} from 'deepcrawl';
import { AlertTriangle, Copy, RefreshCw } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { SpinnerButton } from '@/components/spinner-button';
import {
  ExtractLinksGridIcon,
  GetMarkdownGridIcon,
  ReadUrlGridIcon,
} from '../animate-ui/components/grid-icons';
import { handlePlaygroundError } from './utils/error-handler';

// Use only SDK types - no custom playground types needed
export type ApiOperation = 'getMarkdown' | 'readUrl' | 'extractLinks';

// Internal response wrapper that extends SDK data with UI metadata
interface PlaygroundResponseMetadata {
  executionTime?: number;
  errorType?:
    | 'read'
    | 'links'
    | 'rateLimit'
    | 'auth'
    | 'validation'
    | 'network'
    | 'server'
    | 'unknown';
  retryable?: boolean;
  retryAfter?: number;
  userMessage?: string;
}

// Union of all possible success data types from SDK
export type ApiResponseData =
  | GetMarkdownOutput
  | ReadUrlOutput
  | ExtractLinksOutput;

// Playground response combines SDK data with UI metadata
export type PlaygroundResponse = PlaygroundResponseMetadata & {
  data?: ApiResponseData;
  error?: string;
  status?: number;
  targetUrl?: string;
  timestamp?: string;
};

const apiOptions = [
  {
    label: 'Get Markdown',
    value: 'getMarkdown',
    icon: GetMarkdownGridIcon,
    endpoint: '/read',
    method: 'GET',
    description: 'Extract markdown content from the URL',
  },
  {
    label: 'Read URL',
    value: 'readUrl',
    icon: ReadUrlGridIcon,
    endpoint: '/read',
    method: 'POST',
    description: 'Get full result object with metadata',
  },
  {
    label: 'Extract Links',
    value: 'extractLinks',
    icon: ExtractLinksGridIcon,
    endpoint: '/links',
    method: 'POST',
    description: 'Extract all links and sitemap data',
  },
] as const;

const apiOptionValues = ['getMarkdown', 'readUrl', 'extractLinks'] as const;

// Get API key from environment or use a demo key
const API_KEY =
  process.env.NEXT_PUBLIC_DEEPCRAWL_API_KEY || 'demo-key-for-playground';

export function PlaygroundClient() {
  const [url, setUrl] = useState('https://hono.dev');
  const [selectedOptionValue, setSelectedOptionValue] = useQueryState(
    'option',
    parseAsStringLiteral(apiOptionValues).withDefault('getMarkdown'),
  );

  // Initialize SDK client
  const sdkClient = useRef<DeepcrawlApp | null>(null);

  useEffect(() => {
    sdkClient.current = new DeepcrawlApp({
      apiKey: API_KEY,
      baseUrl:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:8080'
          : 'https://api.deepcrawl.dev',
    });
  }, []);

  const selectedOption =
    apiOptions.find((option) => option.value === selectedOptionValue) ||
    apiOptions[0];
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    getMarkdown: false,
    readUrl: false,
    extractLinks: false,
  });
  const [responses, setResponses] = useState<
    Record<string, PlaygroundResponse>
  >({});
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [executionStartTime, setExecutionStartTime] = useState<
    Record<string, number>
  >({});
  const [currentExecutionTime, setCurrentExecutionTime] = useState<
    Record<string, number>
  >({});

  // Add ref for LinkIcon
  const linkIconRef = useRef<LinkIconHandle>(null);

  // Add deduplication ref to prevent multiple simultaneous requests
  const activeRequestsRef = useRef<Set<string>>(new Set());

  // Timer effect to update current execution time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExecutionTime((prev) => {
        const updated = { ...prev };
        for (const operation in executionStartTime) {
          if (isLoading[operation] && executionStartTime[operation]) {
            updated[operation] = Date.now() - executionStartTime[operation];
          }
        }
        return updated;
      });
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, [executionStartTime, isLoading]);

  // Use centralized error handler
  const handleError = (
    error: unknown,
    operation: ApiOperation,
    label: string,
    executionTime: number,
  ): PlaygroundResponse => {
    return handlePlaygroundError(error, {
      operation,
      label,
      executionTime,
      onRetry: executeApiCall,
    });
  };

  const executeApiCall = async (operation: ApiOperation, label: string) => {
    if (!sdkClient.current) return;

    // Prevent duplicate requests
    const requestKey = `${operation}-${url}`;
    if (activeRequestsRef.current.has(requestKey)) {
      toast.info('Request already in progress');
      return;
    }

    setIsLoading((prev) => ({ ...prev, [operation]: true }));
    activeRequestsRef.current.add(requestKey);

    const startTime = Date.now();

    try {
      let result: unknown;
      let targetUrl = url;

      switch (operation) {
        case 'getMarkdown': {
          result = await sdkClient.current.getMarkdown(url);
          break;
        }
        case 'readUrl': {
          const readData = await sdkClient.current.readUrl(url, {});
          result = readData;
          targetUrl = (readData as ReadUrlOutput)?.targetUrl || url;
          break;
        }
        case 'extractLinks': {
          const linksData = await sdkClient.current.extractLinks(url, {});
          result = linksData;
          targetUrl = (linksData as ExtractLinksOutput)?.targetUrl || url;
          break;
        }
      }

      const executionTime = Date.now() - startTime;

      setResponses((prev) => ({
        ...prev,
        [operation]: {
          data: result as ApiResponseData,
          status: 200,
          executionTime,
          targetUrl,
          timestamp: new Date().toISOString(),
          errorType: undefined,
          retryable: false,
        },
      }));

      toast.success(`${label} completed successfully`, {
        description: `Processed in ${formatExecutionTime(executionTime)}`,
      });
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorResponse = handleError(error, operation, label, executionTime);

      setResponses((prev) => ({
        ...prev,
        [operation]: errorResponse,
      }));
    } finally {
      // Always cleanup - prevent memory leaks
      setIsLoading((prev) => ({ ...prev, [operation]: false }));
      activeRequestsRef.current.delete(requestKey);
      setCurrentExecutionTime((prev) => ({ ...prev, [operation]: 0 }));
    }
  };

  const handleRetry = (operation: ApiOperation, label: string) => {
    executeApiCall(operation, label);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatResponseData = (data: unknown): string => {
    return JSON.stringify(data, null, 2);
  };

  const formatExecutionTime = (ms: number): string => {
    if (ms < 1000) {
      return `${ms} ms`;
    }
    return `${(ms / 1000).toFixed(2)} s`;
  };

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

  return (
    <div className="min-h-[calc(100svh-theme(spacing.56)))] space-y-6 pb-10">
      <Label htmlFor="url" className="text-muted-foreground">
        API Options
      </Label>

      <div className="grid gap-4 lg:grid-cols-3">
        {apiOptions.map((option) => (
          <Card
            key={option.value}
            onClick={() => setSelectedOptionValue(option.value)}
            onMouseEnter={() => setHoveredOption(option.value)}
            onMouseLeave={() => setHoveredOption(null)}
            className={cn(
              'group relative cursor-pointer transition-all duration-200 ease-out hover:bg-muted/50 hover:shadow-md',
              selectedOption?.value === option.value && 'bg-muted/50',
            )}
          >
            <div className="absolute top-2 left-2 flex items-center justify-center opacity-0 transition-all duration-200 ease-out group-hover:opacity-100">
              <Badge
                variant="outline"
                className="text-muted-foreground text-xs"
              >
                {option.method} {option.endpoint}
              </Badge>
            </div>

            <div className="flex items-center justify-center">
              <option.icon
                cellClassName="size-[3px]"
                animate={
                  hoveredOption === option.value ||
                  Boolean(isLoading[option.value])
                }
              />
            </div>
            <CardContent className="space-y-2 text-center">
              <div className="flex items-center justify-center">
                <CardTitle className="flex items-center gap-2">
                  {option.label}
                </CardTitle>
              </div>
              <CardDescription>{option.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Label htmlFor="url" className="text-muted-foreground">
        Target URL
      </Label>
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div
            className="relative"
            onMouseEnter={() => linkIconRef.current?.startAnimation()}
            onMouseLeave={() => linkIconRef.current?.stopAnimation()}
          >
            <LinkIcon
              ref={linkIconRef}
              size={16}
              className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground"
            />
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  executeApiCall(
                    selectedOption?.value as ApiOperation,
                    selectedOption?.label || '',
                  );
                }
              }}
              className="pl-10 font-mono"
              placeholder="https://hono.dev"
            />
          </div>
        </div>
        {/* Execute button */}
        <SpinnerButton
          className="w-32"
          onClick={() =>
            executeApiCall(
              selectedOption?.value as ApiOperation,
              selectedOption?.label || '',
            )
          }
          isLoading={isLoading[selectedOption?.value || '']}
        >
          {selectedOption?.label}
        </SpinnerButton>
      </div>

      {/* Results Section */}
      {responses[selectedOption?.value || ''] && (
        <>
          <Label htmlFor="url" className="text-muted-foreground">
            Results
          </Label>
          <div>
            {(() => {
              const response = responses[selectedOption?.value || ''];
              if (!response) return null;

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedOption?.method}
                      </Badge>
                      <span className="font-medium text-sm">Response</span>
                      <Badge
                        variant={response.error ? 'destructive' : 'default'}
                        className="text-xs"
                      >
                        {response.status || 'Unknown'}
                      </Badge>
                      {response.errorType && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 text-xs"
                        >
                          {getErrorIcon(response.errorType)}
                          {response.errorType}
                        </Badge>
                      )}
                      {response.executionTime && (
                        <Badge variant="secondary" className="text-xs">
                          {formatExecutionTime(response.executionTime)}
                        </Badge>
                      )}
                      {response.retryable && (
                        <Badge variant="outline" className="text-xs">
                          Retryable
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {response.retryable && (
                        <SpinnerButton
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const operation =
                              selectedOption?.value as ApiOperation;
                            handleRetry(operation, selectedOption?.label || '');
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                          Retry
                        </SpinnerButton>
                      )}
                      <SpinnerButton
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            response.error
                              ? response.error
                              : formatResponseData(response.data),
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </SpinnerButton>
                    </div>
                  </div>

                  <div
                    className={cn(
                      'relative rounded-lg border p-4 text-sm lg:p-6',
                      'max-h-[calc(100svh-20rem)] overflow-auto',
                      response.error
                        ? getErrorColor(response.errorType)
                        : 'bg-muted/50',
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
                    ) : selectedOption?.value === 'getMarkdown' &&
                      typeof response.data === 'string' ? (
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
            })()}
          </div>
        </>
      )}
    </div>
  );
}
