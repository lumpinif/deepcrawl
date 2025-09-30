import { toast } from 'sonner';
import { handlePlaygroundError } from '@/utils/playground/error-handler';
import { isPlausibleUrl } from '@/utils/playground/url-input-pre-validation';
import {
  type APIResponseData,
  type DeepcrawlOperations,
  type GetAnyOperationState,
  GetMarkdownOptionsSchemaWithoutUrl,
  LinksOptionsSchemaWithoutUrl,
  type PlaygroundOperationResponse,
  type PlaygroundResponses,
  ReadUrlOptionsSchemaWithoutUrl,
} from './types';
import { useDeepcrawlClient } from './use-deepcrawl-client';
import { useExecutionTimer } from './use-execution-timer';

interface UseTaskInputOperationsProps {
  requestUrl: string;
  getAnyOperationState: GetAnyOperationState;
  activeRequestsRef: React.RefObject<Set<string>>;
  setIsExecuting: (
    fn: (
      prev: Record<DeepcrawlOperations, boolean>,
    ) => Record<DeepcrawlOperations, boolean>,
  ) => void;
  setResponses: (
    fn: (prev: PlaygroundResponses) => PlaygroundResponses,
  ) => void;
}

// API key configuration - matches playground-client pattern
const API_KEY =
  process.env.NEXT_PUBLIC_DEEPCRAWL_API_KEY || 'demo-key-for-playground';

export function useTaskInputOperations({
  requestUrl,
  getAnyOperationState,
  activeRequestsRef,
  setIsExecuting,
  setResponses,
}: UseTaskInputOperationsProps) {
  // Initialize SDK client with custom hook
  const {
    client: sdkClient,
    ensureClient,
    isReady,
  } = useDeepcrawlClient({
    apiKey: API_KEY,
    baseUrl:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080'
        : 'https://api.deepcrawl.dev',
  });

  // Initialize execution timer hook
  const {
    startTimer,
    stopTimer,
    getElapsedTime,
    getCurrentExecutionTime,
    formatTime,
  } = useExecutionTimer();

  // Use centralized error handler
  const handleError = (
    error: unknown,
    operation: DeepcrawlOperations,
    label: string,
    executionTime: number,
  ): PlaygroundOperationResponse => {
    const baseError = handlePlaygroundError(error, {
      operation,
      label,
      executionTime,
      onRetry: executeApiCall,
    });
    // Add operation discriminant field
    return { ...baseError, operation } as PlaygroundOperationResponse;
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

    const client = sdkClient ?? ensureClient();

    if (!client) {
      toast.error('Unable to initialize the Deepcrawl client');
      return;
    }

    // Prevent duplicate requests
    const requestKey = `${operation}-${requestUrl}`;
    if (activeRequestsRef.current.has(requestKey)) {
      toast.info('Request already in progress');
      return;
    }

    setIsExecuting((prev) => ({ ...prev, [operation]: true }));
    activeRequestsRef.current.add(requestKey);

    const startTime = startTimer(operation);

    try {
      let result: unknown;
      let targetUrl = requestUrl;

      switch (operation) {
        case 'getMarkdown': {
          const { options: currentOptions } =
            getAnyOperationState('getMarkdown');
          const parse =
            GetMarkdownOptionsSchemaWithoutUrl.parse(currentOptions);
          if (!parse) {
            toast.error(`Invalid options for ${operation}`);
            return;
          }
          result = await client.getMarkdown(requestUrl, currentOptions);
          targetUrl = requestUrl;
          break;
        }
        case 'readUrl': {
          const { options: currentOptions } = getAnyOperationState('readUrl');
          const parse = ReadUrlOptionsSchemaWithoutUrl.parse(currentOptions);
          if (!parse) {
            toast.error(`Invalid options for ${operation}`);
            return;
          }
          const readData = await client.readUrl(requestUrl, currentOptions);
          result = readData;
          targetUrl = readData.targetUrl || requestUrl;
          break;
        }
        case 'extractLinks': {
          const { options: currentOptions } =
            getAnyOperationState('extractLinks');
          const parse = LinksOptionsSchemaWithoutUrl.parse(currentOptions);
          if (!parse) {
            toast.error(`Invalid options for ${operation}`);
            return;
          }
          const linksData = await client.extractLinks(
            requestUrl,
            currentOptions,
          );
          result = linksData;
          targetUrl = linksData.targetUrl || requestUrl;
          break;
        }
      }

      const executionTime = getElapsedTime(operation, startTime);

      setResponses((prev) => ({
        ...prev,
        [operation]: {
          operation,
          data: result as APIResponseData,
          status: 200,
          executionTime,
          targetUrl,
          timestamp: new Date().toISOString(),
          errorType: undefined,
          retryable: false,
        } as PlaygroundOperationResponse,
      }));

      toast.success(
        `${label} completed successfully`,
        //   , {
        //   description: `Processed in ${formatTime(executionTime)}`,
        // }
      );
    } catch (error) {
      const executionTime = getElapsedTime(operation, startTime);
      const errorResponse = handleError(error, operation, label, executionTime);

      setResponses((prev) => ({
        ...prev,
        [operation]: errorResponse,
      }));
    } finally {
      // Always cleanup - prevent memory leaks
      setIsExecuting((prev) => ({ ...prev, [operation]: false }));
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
    getCurrentExecutionTime,
    isReady: sdkClient && isReady,
  };
}
