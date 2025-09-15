import type {
  ExtractLinksOptions,
  ExtractLinksResponse,
  GetMarkdownOptions,
  ReadUrlOptions,
  ReadUrlResponse,
} from 'deepcrawl';
import { toast } from 'sonner';
import { handlePlaygroundError } from '@/utils/playground/error-handler';
import { isPlausibleUrl } from '@/utils/playground/url-input-pre-validation';
import { useDeepcrawlClient } from './use-deepcrawl-client';
import { useExecutionTimer } from './use-execution-timer';
import type {
  DCResponseData,
  DeepcrawlOperations,
  PlaygroundResponse,
} from './use-task-input-state';

interface UseTaskInputOperationsProps {
  requestUrl: string;
  options: {
    readUrl: ReadUrlOptions;
    extractLinks: ExtractLinksOptions;
    getMarkdown: GetMarkdownOptions;
  };
  activeRequestsRef: React.RefObject<Set<string>>;
  setIsLoading: (
    fn: (
      prev: Record<DeepcrawlOperations, boolean>,
    ) => Record<DeepcrawlOperations, boolean>,
  ) => void;
  setResponses: (
    fn: (
      prev: Record<string, PlaygroundResponse>,
    ) => Record<string, PlaygroundResponse>,
  ) => void;
}

// API key configuration - matches playground-client pattern
const API_KEY =
  process.env.NEXT_PUBLIC_DEEPCRAWL_API_KEY || 'demo-key-for-playground';

export function useTaskInputOperations({
  requestUrl,
  options,
  activeRequestsRef,
  setIsLoading,
  setResponses,
}: UseTaskInputOperationsProps) {
  // Initialize SDK client with custom hook
  const { client: sdkClient, isReady } = useDeepcrawlClient({
    apiKey: API_KEY,
    baseUrl:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080'
        : 'https://api.deepcrawl.dev',
  });

  // Initialize execution timer hook
  const { startTimer, stopTimer, getElapsedTime, formatTime } =
    useExecutionTimer();

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
    // Guard against invalid URLs (defense in depth)
    if (!isPlausibleUrl(requestUrl)) {
      toast.error('Please enter a valid URL');
      return;
    }

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
            ...options.getMarkdown,
            url: requestUrl,
          };
          result = await sdkClient.getMarkdown(requestUrl, optionsWithoutUrl);
          targetUrl = requestUrl;
          break;
        }
        case 'readUrl': {
          // Use the configured read options, excluding the url field
          const { url: _, ...optionsWithoutUrl } = {
            ...options.readUrl,
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
            ...options.extractLinks,
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

  return {
    executeApiCall,
    handleRetry,
    formatTime,
    isReady: sdkClient && isReady,
  };
}
