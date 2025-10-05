import { toast } from 'sonner';
import {
  playgroundExtractLinks,
  playgroundGetMarkdown,
  playgroundReadUrl,
} from '@/app/actions/playground';
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
import { useExecutionTimer } from './use-execution-timer';

interface UsePlaygroundOperationsProps {
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

export function usePlaygroundOperations({
  requestUrl,
  getAnyOperationState,
  activeRequestsRef,
  setIsExecuting,
  setResponses,
}: UsePlaygroundOperationsProps) {
  // Initialize execution timer hook
  const {
    startTimer,
    stopTimer,
    getElapsedTime,
    getCurrentExecutionTime,
    formatTime,
  } = useExecutionTimer();

  // Convert server action error response to PlaygroundOperationResponse
  const handleServerActionError = (
    errorResponse: {
      error?: string;
      status?: number;
      errorType?: string;
      targetUrl?: string;
      timestamp?: string;
    },
    operation: DeepcrawlOperations,
    executionTime: number,
  ): PlaygroundOperationResponse => {
    return {
      operation,
      data: undefined,
      status: errorResponse.status || 500,
      executionTime,
      targetUrl: errorResponse.targetUrl || requestUrl,
      timestamp: errorResponse.timestamp || new Date().toISOString(),
      error: errorResponse.error || 'An unknown error occurred',
      errorType: errorResponse.errorType as
        | 'auth'
        | 'network'
        | 'read'
        | 'links'
        | 'unknown',
      retryable: errorResponse.errorType === 'network',
    } as PlaygroundOperationResponse;
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
      let serverResponse: {
        data?: unknown;
        error?: string;
        status?: number;
        errorType?: string;
        targetUrl?: string;
        timestamp?: string;
      };

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

          serverResponse = await playgroundGetMarkdown({
            url: requestUrl,
            ...currentOptions,
          });
          break;
        }
        case 'readUrl': {
          const { options: currentOptions } = getAnyOperationState('readUrl');
          const parse = ReadUrlOptionsSchemaWithoutUrl.parse(currentOptions);
          if (!parse) {
            toast.error(`Invalid options for ${operation}`);
            return;
          }

          serverResponse = await playgroundReadUrl({
            url: requestUrl,
            ...currentOptions,
          });
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

          serverResponse = await playgroundExtractLinks({
            url: requestUrl,
            ...currentOptions,
          });
          break;
        }
        default:
          toast.error(`Unknown operation: ${operation}`);
          return;
      }

      const executionTime = getElapsedTime(operation, startTime);

      // Check if server action returned an error
      if (serverResponse.error) {
        const errorResponse = handleServerActionError(
          serverResponse,
          operation,
          executionTime,
        );

        setResponses((prev) => ({
          ...prev,
          [operation]: errorResponse,
        }));

        toast.error(`${label} failed`, {
          description: serverResponse.error,
        });

        return;
      }

      // Success case
      const targetUrl =
        serverResponse.targetUrl ||
        (typeof serverResponse.data === 'object' &&
        serverResponse.data !== null &&
        'targetUrl' in serverResponse.data
          ? (serverResponse.data as { targetUrl?: string }).targetUrl
          : undefined) ||
        requestUrl;

      setResponses((prev) => ({
        ...prev,
        [operation]: {
          operation,
          data: serverResponse.data as APIResponseData,
          status: 200,
          executionTime,
          targetUrl,
          timestamp: new Date().toISOString(),
          errorType: undefined,
          retryable: false,
        } as PlaygroundOperationResponse,
      }));

      toast.success(`${label} completed successfully`);
    } catch (error) {
      const executionTime = getElapsedTime(operation, startTime);
      const errorResponse = handleServerActionError(
        {
          error:
            error instanceof Error
              ? error.message
              : 'An unknown error occurred',
          status: 500,
          errorType: 'unknown',
        },
        operation,
        executionTime,
      );

      setResponses((prev) => ({
        ...prev,
        [operation]: errorResponse,
      }));

      toast.error(`${label} failed`, {
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
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
    isReady: true, // Always ready with Server Actions
  };
}
