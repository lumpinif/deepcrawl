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
import type {
  ExtractLinksOutput,
  GetMarkdownOutput,
  ReadUrlOutput,
} from 'deepcrawl';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  ExtractLinksGridIcon,
  GetMarkdownGridIcon,
  ReadUrlGridIcon,
} from '@/components/animate-ui/components/grid-icons';
import { SpinnerButton } from '@/components/spinner-button';
import { useDeepCrawlClient } from '@/hooks/playground/use-deepcrawl-client';
import { useExecutionTimer } from '@/hooks/playground/use-execution-timer';
import { handlePlaygroundError } from '@/utils/playground/error-handler';
import { DCResponseRenderer } from './dc-response-renderer';

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
export type DCResponseData =
  | GetMarkdownOutput
  | ReadUrlOutput
  | ExtractLinksOutput;

// Playground response combines SDK data with UI metadata
export type PlaygroundResponse = PlaygroundResponseMetadata & {
  data?: DCResponseData;
  error?: string;
  status?: number;
  targetUrl?: string;
  timestamp?: string;
};

const DeepcrawlFeatures = [
  {
    label: 'Get Markdown',
    operation: 'getMarkdown',
    icon: GetMarkdownGridIcon,
    endpoint: '/read',
    method: 'GET',
    description: 'Extract markdown content from the URL',
  },
  {
    label: 'Read URL',
    operation: 'readUrl',
    icon: ReadUrlGridIcon,
    endpoint: '/read',
    method: 'POST',
    description: 'Get full result object with metadata',
  },
  {
    label: 'Extract Links',
    operation: 'extractLinks',
    icon: ExtractLinksGridIcon,
    endpoint: '/links',
    method: 'POST',
    description: 'Extract all links and sitemap data',
  },
] as const;

export type DeepcrawlOperations =
  (typeof DeepcrawlFeatures)[number]['operation'];
const operations: readonly DeepcrawlOperations[] = [
  'getMarkdown',
  'readUrl',
  'extractLinks',
] as const;

// Get API key from environment or use a demo key
const API_KEY =
  process.env.NEXT_PUBLIC_DEEPCRAWL_API_KEY || 'demo-key-for-playground';

export function PlaygroundClient() {
  const [url, setUrl] = useState('https://hono.dev');
  const [selectedOperation, setSelectedOperation] = useQueryState(
    'operation',
    parseAsStringLiteral(operations).withDefault('getMarkdown'),
  );

  // Initialize SDK client with custom hook
  const { client: sdkClient, isReady } = useDeepCrawlClient({
    apiKey: API_KEY,
    baseUrl:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080'
        : 'https://api.deepcrawl.dev',
  });

  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    getMarkdown: false,
    readUrl: false,
    extractLinks: false,
  });
  const [responses, setResponses] = useState<
    Record<string, PlaygroundResponse>
  >({});
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  // Initialize execution timer hook
  const { startTimer, stopTimer, getElapsedTime, formatTime } =
    useExecutionTimer();

  const selectedOP =
    DeepcrawlFeatures.find(
      (feature) => feature.operation === selectedOperation,
    ) || DeepcrawlFeatures[0];

  // Add ref for LinkIcon
  const linkIconRef = useRef<LinkIconHandle>(null);

  // Add deduplication ref to prevent multiple simultaneous requests
  const activeRequestsRef = useRef<Set<string>>(new Set());

  // Use centralized error handler
  const handleError = (
    error: unknown,
    operation: DeepcrawlOperations,
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

  const executeApiCall = async (
    operation: DeepcrawlOperations,
    label: string,
  ) => {
    if (!sdkClient || !isReady) {
      toast.error('Please wait for the SDK client to be ready');
      return;
    }

    // Prevent duplicate requests
    const requestKey = `${operation}-${url}`;
    if (activeRequestsRef.current.has(requestKey)) {
      toast.info('Request already in progress');
      return;
    }

    setIsLoading((prev) => ({ ...prev, [operation]: true }));
    activeRequestsRef.current.add(requestKey);

    const startTime = startTimer(operation);

    try {
      let result: unknown;
      let targetUrl = url;

      switch (operation) {
        case 'getMarkdown': {
          result = await sdkClient.getMarkdown(url);
          break;
        }
        case 'readUrl': {
          const readData = await sdkClient.readUrl(url, {});
          result = readData;
          targetUrl = (readData as ReadUrlOutput)?.targetUrl || url;
          break;
        }
        case 'extractLinks': {
          const linksData = await sdkClient.extractLinks(url, {});
          result = linksData;
          targetUrl = (linksData as ExtractLinksOutput)?.targetUrl || url;
          break;
        }
      }

      const executionTime = getElapsedTime(operation, startTime);

      setResponses((prev) => ({
        ...prev,
        [operation]: {
          data: result as DCResponseData,
          status: 200,
          executionTime,
          targetUrl,
          timestamp: new Date().toISOString(),
          errorType: undefined,
          retryable: false,
        },
      }));

      toast.success(`${label} completed successfully`, {
        description: `Processed in ${formatTime(executionTime)}`,
      });
    } catch (error) {
      const executionTime = getElapsedTime(operation, startTime);
      const errorResponse = handleError(error, operation, label, executionTime);

      setResponses((prev) => ({
        ...prev,
        [operation]: errorResponse,
      }));
    } finally {
      // Always cleanup - prevent memory leaks
      setIsLoading((prev) => ({ ...prev, [operation]: false }));
      activeRequestsRef.current.delete(requestKey);
      stopTimer(operation);
    }
  };

  const handleRetry = (operation: DeepcrawlOperations, label: string) => {
    executeApiCall(operation, label);
  };

  return (
    <div className="min-h-[calc(100svh-theme(spacing.56)))] space-y-6 pb-10">
      <Label htmlFor="url" className="text-muted-foreground">
        Main Features
      </Label>

      <div className="grid gap-4 lg:grid-cols-3">
        {DeepcrawlFeatures.map((feat) => (
          <Card
            key={feat.operation}
            onClick={() => setSelectedOperation(feat.operation)}
            onMouseEnter={() => setHoveredOption(feat.operation)}
            onMouseLeave={() => setHoveredOption(null)}
            className={cn(
              'group relative cursor-pointer transition-all duration-200 ease-out hover:bg-muted/50 hover:shadow-md',
              selectedOP?.operation === feat.operation && 'bg-muted/50',
            )}
          >
            <div className="absolute top-2 left-2 flex items-center justify-center opacity-0 transition-all duration-200 ease-out group-hover:opacity-100">
              <Badge
                variant="outline"
                className="text-muted-foreground text-xs"
              >
                {feat.method} {feat.endpoint}
              </Badge>
            </div>

            <div className="flex items-center justify-center">
              <feat.icon
                cellClassName="size-[3px]"
                animate={
                  hoveredOption === feat.operation ||
                  Boolean(isLoading[feat.operation])
                }
              />
            </div>
            <CardContent className="space-y-2 text-center">
              <div className="flex items-center justify-center">
                <CardTitle className="flex items-center gap-2">
                  {feat.label}
                </CardTitle>
              </div>
              <CardDescription>{feat.description}</CardDescription>
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
                    selectedOP?.operation as DeepcrawlOperations,
                    selectedOP?.label || '',
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
              selectedOP?.operation as DeepcrawlOperations,
              selectedOP?.label || '',
            )
          }
          isLoading={isLoading[selectedOP?.operation || '']}
        >
          {selectedOP?.label}
        </SpinnerButton>
      </div>

      {/* Results Section */}
      {responses[selectedOP?.operation || ''] && (
        <>
          <Label htmlFor="url" className="text-muted-foreground">
            Results
          </Label>
          <div>
            {(() => {
              const response = responses[selectedOP?.operation || ''];
              if (!response) return null;

              return (
                <DCResponseRenderer
                  response={response}
                  operation={selectedOP?.operation as DeepcrawlOperations}
                  operationLabel={selectedOP?.label || ''}
                  operationMethod={selectedOP?.method || ''}
                  onRetry={() => {
                    const operation =
                      selectedOP?.operation as DeepcrawlOperations;
                    handleRetry(operation, selectedOP?.label || '');
                  }}
                  formatTime={formatTime}
                />
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}
