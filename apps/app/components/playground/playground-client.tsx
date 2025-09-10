'use client';

import type { LinkIconHandle } from '@deepcrawl/ui/components/icons/link';
import { LinkIcon } from '@deepcrawl/ui/components/icons/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@deepcrawl/ui/components/ui/accordion';
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
  ExtractLinksOptions,
  ExtractLinksResponse,
  GetMarkdownOptions,
  GetMarkdownResponse,
  ReadUrlOptions,
  ReadUrlResponse,
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
import { OptionsPanel } from './options-panel';
import { PGResponseArea } from './pg-response-area';

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
  | GetMarkdownResponse
  | ReadUrlResponse
  | ExtractLinksResponse;

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
  const [requestUrl, setRequestUrl] = useState('https://hono.dev');
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

  // Options state management - separate state for each operation
  const [readOptions, setReadOptions] = useState<ReadUrlOptions>({ url: '' });
  const [linksOptions, setLinksOptions] = useState<ExtractLinksOptions>({
    url: '',
  });
  const [getMarkdownOptions, setGetMarkdownOptions] =
    useState<GetMarkdownOptions>({
      url: '',
    });

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
    if (!(sdkClient && isReady)) {
      toast.error('Please wait for the SDK client to be ready');
      return;
    }

    // Prevent duplicate requests
    const requestKey = `${operation}-${requestUrl}`;
    if (activeRequestsRef.current.has(requestKey)) {
      toast.info('Request already in progress');
      return;
    }

    setIsLoading((prev) => ({ ...prev, [operation]: true }));
    activeRequestsRef.current.add(requestKey);

    const startTime = startTimer(operation);

    try {
      let result: unknown;
      let targetUrl = requestUrl;

      switch (operation) {
        case 'getMarkdown': {
          // Use the configured markdown options, excluding the url field
          const { url: _, ...optionsWithoutUrl } = {
            ...getMarkdownOptions,
            url: requestUrl,
          };
          result = await sdkClient.getMarkdown(requestUrl, optionsWithoutUrl);
          targetUrl = requestUrl;
          break;
        }
        case 'readUrl': {
          // Use the configured read options, excluding the url field
          const { url: _, ...optionsWithoutUrl } = {
            ...readOptions,
            url: requestUrl,
          };
          const readData = await sdkClient.readUrl(
            requestUrl,
            optionsWithoutUrl,
          );
          result = readData;
          targetUrl = (readData as ReadUrlResponse)?.targetUrl || requestUrl;
          break;
        }
        case 'extractLinks': {
          // Use the configured links options, excluding the url field
          const { url: _, ...optionsWithoutUrl } = {
            ...linksOptions,
            url: requestUrl,
          };
          const linksData = await sdkClient.extractLinks(
            requestUrl,
            optionsWithoutUrl,
          );
          result = linksData;
          targetUrl =
            (linksData as ExtractLinksResponse)?.targetUrl || requestUrl;
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
    <div className="min-h-[calc(100svh-theme(spacing.80))] space-y-6 pb-10">
      <Label className="text-muted-foreground" htmlFor="url">
        Choose a feature
      </Label>

      <div className="grid gap-3 lg:grid-cols-3">
        {DeepcrawlFeatures.map((feat) => (
          <Card
            className={cn(
              'group relative cursor-pointer transition-all duration-200 ease-out hover:bg-muted/50 hover:shadow-md',
              selectedOP?.operation === feat.operation && 'bg-muted/50',
            )}
            key={feat.operation}
            onClick={() => setSelectedOperation(feat.operation)}
            onMouseEnter={() => setHoveredOption(feat.operation)}
            onMouseLeave={() => setHoveredOption(null)}
          >
            <div className="absolute top-2 left-2 flex items-center justify-center opacity-0 transition-all duration-200 ease-out group-hover:opacity-100">
              <Badge
                className="text-muted-foreground text-xs"
                variant="outline"
              >
                {feat.method} {feat.endpoint}
              </Badge>
            </div>

            <div className="flex items-center justify-center">
              <feat.icon
                animate={
                  hoveredOption === feat.operation ||
                  Boolean(isLoading[feat.operation])
                }
                cellClassName="size-[3px]"
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

      {/* Options Panel */}
      <Accordion collapsible type="single">
        <AccordionItem value="options">
          <AccordionTrigger className="text-muted-foreground">
            Options for {selectedOP?.label}
          </AccordionTrigger>
          <AccordionContent>
            <OptionsPanel
              onOptionsChange={(newOptions) => {
                if (selectedOperation === 'readUrl') {
                  setReadOptions(newOptions as ReadUrlOptions);
                } else if (selectedOperation === 'extractLinks') {
                  setLinksOptions(newOptions as ExtractLinksOptions);
                } else if (selectedOperation === 'getMarkdown') {
                  setGetMarkdownOptions(newOptions as GetMarkdownOptions);
                }
              }}
              options={
                selectedOperation === 'readUrl'
                  ? { ...readOptions, url: requestUrl }
                  : selectedOperation === 'extractLinks'
                    ? { ...linksOptions, url: requestUrl }
                    : selectedOperation === 'getMarkdown'
                      ? { ...getMarkdownOptions, url: requestUrl }
                      : { url: requestUrl }
              }
              selectedOperation={selectedOperation}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Label className="text-muted-foreground" htmlFor="url">
        Enter target URL
      </Label>
      <div className="flex w-full items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-sm">
        <div className="w-full flex-1 space-y-2">
          <div
            className="relative"
            onMouseEnter={() => linkIconRef.current?.startAnimation()}
            onMouseLeave={() => linkIconRef.current?.stopAnimation()}
            role="link"
          >
            <LinkIcon
              className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground"
              ref={linkIconRef}
              size={16}
            />
            <Input
              className="!bg-transparent border-none pl-10 font-mono shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-transparent"
              id="url"
              onChange={(e) => setRequestUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  executeApiCall(
                    selectedOP?.operation as DeepcrawlOperations,
                    selectedOP?.label || '',
                  );
                }
              }}
              placeholder="https://hono.dev"
              value={requestUrl}
            />
          </div>
        </div>
        {/* Execute button */}
        <SpinnerButton
          className="w-32"
          disabled={!requestUrl}
          isLoading={isLoading[selectedOP?.operation || '']}
          onClick={() =>
            executeApiCall(
              selectedOP?.operation as DeepcrawlOperations,
              selectedOP?.label || '',
            )
          }
        >
          {selectedOP?.label}
        </SpinnerButton>
      </div>

      {/* Results Section */}
      {responses[selectedOP?.operation || ''] && (
        <>
          <Label className="text-muted-foreground" htmlFor="url">
            Results
          </Label>
          <div>
            {(() => {
              const response = responses[selectedOP?.operation || ''];
              if (!response) {
                return null;
              }

              return (
                <PGResponseArea
                  formatTime={formatTime}
                  onRetry={() => {
                    const operation =
                      selectedOP?.operation as DeepcrawlOperations;
                    handleRetry(operation, selectedOP?.label || '');
                  }}
                  operation={selectedOP?.operation as DeepcrawlOperations}
                  operationLabel={selectedOP?.label || ''}
                  operationMethod={selectedOP?.method || ''}
                  response={response}
                />
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}
