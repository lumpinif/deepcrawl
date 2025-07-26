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
import { Copy } from 'lucide-react';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import {
  extractLinksAction,
  getMarkdownAction,
  readUrlAction,
} from '@/app/actions/deepcrawl';
import { SpinnerButton } from '@/components/spinner-button';
import {
  ExtractLinksGridIcon,
  GetMarkdownGridIcon,
  ReadUrlGridIcon,
} from '../animate-ui/components/grid-icons';

interface ApiResponse {
  data?: unknown;
  error?: string;
  status?: number;
  executionTime?: number;
  errorType?: 'auth' | 'network' | 'read' | 'links' | 'unknown';
  targetUrl?: string;
  timestamp?: string;
}

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

export function PlaygroundClient() {
  const [url, setUrl] = useState('https://example.com');
  const [selectedOptionValue, setSelectedOptionValue] = useQueryState(
    'option',
    parseAsStringLiteral(apiOptionValues).withDefault('getMarkdown'),
  );

  const selectedOption =
    apiOptions.find((option) => option.value === selectedOptionValue) ||
    apiOptions[0];
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    getMarkdown: false,
    readUrl: false,
    extractLinks: false,
  });
  const [responses, setResponses] = useState<Record<string, ApiResponse>>({});
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

  const executeApiCall = async (
    operation: 'getMarkdown' | 'readUrl' | 'extractLinks',
    label: string,
  ) => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    // Create unique request key for deduplication
    const requestKey = `${operation}-${url}`;

    // Check if this exact request is already in progress
    if (activeRequestsRef.current.has(requestKey)) {
      return;
    }

    // Add to active requests
    activeRequestsRef.current.add(requestKey);

    const startTime = Date.now();
    setExecutionStartTime((prev) => ({ ...prev, [operation]: startTime }));
    setIsLoading((prev) => ({ ...prev, [operation]: true }));

    try {
      let result: {
        data?: unknown;
        error?: string;
        status?: number;
        errorType?: 'auth' | 'network' | 'read' | 'links' | 'unknown';
        targetUrl?: string;
        timestamp?: string;
      };

      switch (operation) {
        case 'getMarkdown':
          result = await getMarkdownAction({ url });
          break;
        case 'readUrl':
          result = await readUrlAction({ url });
          break;
        case 'extractLinks':
          result = await extractLinksAction({ url });
          break;
      }

      const executionTime = Date.now() - startTime;

      if (result.error) {
        setResponses((prev) => ({
          ...prev,
          [operation]: {
            error: result.error,
            status: result.status,
            executionTime,
            errorType: result.errorType,
            targetUrl: result.targetUrl,
            timestamp: result.timestamp,
          },
        }));

        // Enhanced error toast based on error type
        const errorMessage = getErrorMessage(result.errorType, result.error);
        toast.error(`${label} failed: ${errorMessage}`);
      } else {
        setResponses((prev) => ({
          ...prev,
          [operation]: {
            data: result.data,
            status: result.status,
            executionTime,
          },
        }));
        toast.success(`${label} completed successfully`);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      const executionTime = Date.now() - startTime;

      setResponses((prev) => ({
        ...prev,
        [operation]: {
          error: errorMessage,
          status: 500,
          executionTime,
          errorType: 'unknown',
        },
      }));
      toast.error(`${label} failed: ${errorMessage}`);
    } finally {
      // Remove from active requests
      activeRequestsRef.current.delete(requestKey);

      setIsLoading((prev) => ({ ...prev, [operation]: false }));
      setExecutionStartTime((prev) => {
        const updated = { ...prev };
        delete updated[operation];
        return updated;
      });
      setCurrentExecutionTime((prev) => {
        const updated = { ...prev };
        delete updated[operation];
        return updated;
      });
    }
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

  const getErrorMessage = (
    errorType?: string,
    defaultError?: string,
  ): string => {
    switch (errorType) {
      case 'auth':
        return 'Authentication failed - please check your API key';
      case 'network':
        return 'Network error - please check your connection and try again';
      case 'read':
        return 'Failed to read the URL - the page might be inaccessible';
      case 'links':
        return 'Failed to extract links - the page structure might be complex';
      default:
        return defaultError || 'An unknown error occurred';
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
            {/* Timer in top right corner */}
            {isLoading[option.value] && currentExecutionTime[option.value] && (
              <div className="absolute top-2 right-2 animate-pulse rounded-md px-2 py-1 font-mono text-green-500 text-xs">
                {formatExecutionTime(currentExecutionTime[option.value] || 0)}
              </div>
            )}

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
                    selectedOption?.value as
                      | 'getMarkdown'
                      | 'readUrl'
                      | 'extractLinks',
                    selectedOption?.label || '',
                  );
                }
              }}
              className="pl-10 font-mono"
              placeholder="https://example.com"
            />
          </div>
        </div>
        <SpinnerButton
          className="w-32"
          onClick={() =>
            executeApiCall(
              selectedOption?.value as
                | 'getMarkdown'
                | 'readUrl'
                | 'extractLinks',
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
                        <Badge variant="outline" className="text-xs">
                          {response.errorType}
                        </Badge>
                      )}
                      {response.executionTime && (
                        <Badge variant="secondary" className="text-xs">
                          {formatExecutionTime(response.executionTime)}
                        </Badge>
                      )}
                    </div>
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

                  <div
                    className={cn(
                      'relative rounded-lg border p-4 text-sm lg:p-6',
                      'max-h-[calc(100svh-20rem)] overflow-auto',
                      response.error
                        ? 'border-destructive/50 bg-destructive/5'
                        : 'bg-muted/50',
                    )}
                  >
                    {response.error ? (
                      <pre className="whitespace-pre-wrap font-mono">
                        {response.error}
                      </pre>
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
