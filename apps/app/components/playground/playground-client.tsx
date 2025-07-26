'use client';

import type { LinkIconHandle } from '@deepcrawl/ui/components/icons/link';
import { LinkIcon } from '@deepcrawl/ui/components/icons/link';
import { Badge } from '@deepcrawl/ui/components/ui/badge';
import { Button } from '@deepcrawl/ui/components/ui/button';
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
  DeepcrawlAuthError,
  DeepcrawlError,
  DeepcrawlLinksError,
  DeepcrawlNetworkError,
  DeepcrawlReadError,
} from 'deepcrawl';
import { Copy, X } from 'lucide-react';
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

// Get API key from environment or use a demo key
// If you want to use your own API key, you can set it in the .env.local file
// NEXT_PUBLIC_DEEPCRAWL_API_KEY=your-api-key
// We don't use API key in playground, but it's still here for reference
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

  // Add ref for abort controllers
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

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

    // Create new AbortController for this request
    const abortController = new AbortController();

    // Store the controller so it can be cancelled
    if (!abortControllersRef.current) {
      abortControllersRef.current = new Map();
    }
    abortControllersRef.current.set(operation, abortController);

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

      if (!sdkClient.current) {
        throw new Error('SDK client not initialized');
      }

      switch (operation) {
        case 'getMarkdown': {
          const markdown = await sdkClient.current.getMarkdown(url, {
            signal: abortController.signal,
          });
          result = { data: markdown, status: 200 };
          break;
        }
        case 'readUrl': {
          const readData = await sdkClient.current.readUrl(
            url,
            {},
            {
              signal: abortController.signal,
            },
          );
          result = { data: readData, status: 200 };
          break;
        }
        case 'extractLinks': {
          const linksData = await sdkClient.current.extractLinks(
            url,
            {},
            {
              signal: abortController.signal,
            },
          );
          result = { data: linksData, status: 200 };
          break;
        }
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
        const errorMessage = getErrorMessage(result.error);
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
      const executionTime = Date.now() - startTime;

      // Check if it was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        setResponses((prev) => ({
          ...prev,
          [operation]: {
            error: 'Request cancelled by user',
            status: 0,
            executionTime,
            errorType: 'unknown',
          },
        }));
        toast.info(`${label} cancelled`);
        return;
      }

      // Handle SDK-specific errors
      let errorType: ApiResponse['errorType'] = 'unknown';
      let errorMessage = 'An error occurred';
      let status = 500;
      let targetUrl: string | undefined;

      if (error instanceof DeepcrawlAuthError) {
        errorType = 'auth';
        errorMessage = error.message;
        status = error.status || 401;
      } else if (error instanceof DeepcrawlReadError) {
        errorType = 'read';
        errorMessage = error.message;
        status = error.status || 400;
        targetUrl = error.targetUrl;
      } else if (error instanceof DeepcrawlLinksError) {
        errorType = 'links';
        errorMessage = error.message;
        status = error.status || 400;
        targetUrl = error.targetUrl;
      } else if (error instanceof DeepcrawlNetworkError) {
        errorType = 'network';
        errorMessage = error.message;
        status = error.status || 503;
      } else if (error instanceof DeepcrawlError) {
        errorMessage = error.message;
        status = error.status || 500;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setResponses((prev) => ({
        ...prev,
        [operation]: {
          error: errorMessage,
          status,
          executionTime,
          errorType,
          targetUrl,
        },
      }));

      toast.error(`${label} failed: ${errorMessage}`);
    } finally {
      // Remove from active requests
      activeRequestsRef.current.delete(requestKey);

      // Clean up abort controller
      abortControllersRef.current?.delete(operation);

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

  const getErrorMessage = (defaultError?: string): string => {
    return defaultError || 'An unknown error occurred';
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
              placeholder="https://hono.dev"
            />
          </div>
        </div>
        {isLoading[selectedOption?.value || ''] ? (
          <Button
            className="w-32"
            variant="destructive"
            onClick={() => {
              const controller = abortControllersRef.current?.get(
                selectedOption?.value || '',
              );
              if (controller) {
                controller.abort();
              }
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        ) : (
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
        )}
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
