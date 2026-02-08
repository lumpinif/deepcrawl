import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  playgroundExtractLinks,
  playgroundGetMarkdown,
  playgroundReadUrl,
} from '@/app/actions/playground';
import { PLAYGROUND_API_KEY_NAME } from '@/lib/playground-api-key';
import { ensurePlaygroundApiKey } from '@/lib/playground-api-key.client';
import { shouldUsePlaygroundApiKey } from '@/lib/playground-api-key-policy';
import {
  handlePlaygroundClientErrorResponse,
  handleUnexpectedPlaygroundError,
} from '@/utils/playground/error-handler.client';
import { isPlausibleUrl } from '@/utils/playground/url-input-pre-validation';
import {
  type APISuccessResponses,
  type DeepcrawlOperations,
  GetMarkdownOptionsSchemaWithoutUrl,
  LinksOptionsSchemaWithoutUrl,
  type PlaygroundActions,
  type PlaygroundCoreState,
  type PlaygroundOperationResponse,
  type PlaygroundOptionsState,
  type PlaygroundResponse,
  ReadUrlOptionsSchemaWithoutUrl,
} from './types';
import { useExecutionTimer } from './use-execution-timer';

interface UsePlaygroundOperationsProps {
  requestUrl: string;
  getAnyOperationState: PlaygroundOptionsState['getAnyOperationState'];
  activeRequestsRef: PlaygroundCoreState['activeRequestsRef'];
  setIsExecuting: PlaygroundActions['setIsExecuting'];
  setResponses: PlaygroundActions['setResponses'];
}

export function usePlaygroundOperations({
  requestUrl,
  getAnyOperationState,
  activeRequestsRef,
  setIsExecuting,
  setResponses,
}: UsePlaygroundOperationsProps) {
  const router = useRouter();

  // Initialize execution timer hook
  const {
    startTimer,
    stopTimer,
    getElapsedTime,
    getCurrentExecutionTime,
    formatTime,
  } = useExecutionTimer();

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
      const showMissingPlaygroundApiKeyToast = () => {
        toast.error(
          `You need an API key named "${PLAYGROUND_API_KEY_NAME}" to use dashboard.`,
          {
            id: 'missing-playground-api-key',
            action: {
              label: 'Open API Keys',
              onClick: () => {
                router.push('/app/api-keys');
              },
            },
          },
        );
      };

      const runOperation = async (
        apiKey?: string,
      ): Promise<PlaygroundResponse> => {
        switch (operation) {
          case 'getMarkdown': {
            const { options: currentOptions } =
              getAnyOperationState('getMarkdown');
            const parse =
              GetMarkdownOptionsSchemaWithoutUrl.parse(currentOptions);
            if (!parse) {
              toast.error(`Invalid options for ${operation}`);
              return { error: `Invalid options for ${operation}` };
            }

            return await playgroundGetMarkdown(
              {
                url: requestUrl,
                ...currentOptions,
              },
              apiKey,
            );
          }
          case 'readUrl': {
            const { options: currentOptions } = getAnyOperationState('readUrl');
            const parse = ReadUrlOptionsSchemaWithoutUrl.parse(currentOptions);
            if (!parse) {
              toast.error(`Invalid options for ${operation}`);
              return { error: `Invalid options for ${operation}` };
            }

            return await playgroundReadUrl(
              {
                url: requestUrl,
                ...currentOptions,
              },
              apiKey,
            );
          }
          case 'extractLinks': {
            const { options: currentOptions } =
              getAnyOperationState('extractLinks');
            const parse = LinksOptionsSchemaWithoutUrl.parse(currentOptions);
            if (!parse) {
              toast.error(`Invalid options for ${operation}`);
              return { error: `Invalid options for ${operation}` };
            }

            return await playgroundExtractLinks(
              {
                url: requestUrl,
                ...currentOptions,
              },
              apiKey,
            );
          }
          default:
            toast.error(`Unknown operation: ${operation}`);
            return { error: `Unknown operation: ${operation}` };
        }
      };

      // First attempt: cookie session / server JWT.
      let serverResponse: PlaygroundResponse = await runOperation();

      // If auth fails, self-heal by ensuring PLAYGROUND_API_KEY exists on-device,
      // then retry once using api-key auth.
      if (serverResponse.errorType === 'auth' && shouldUsePlaygroundApiKey()) {
        try {
          const apiKey = await ensurePlaygroundApiKey();
          serverResponse = await runOperation(apiKey);
        } catch (error) {
          // If we can't create/read the key, guide the user to the API Keys page.
          // Avoid noisy toasts when the user is not logged in.
          if (!(error instanceof Error && error.message === 'Unauthorized')) {
            showMissingPlaygroundApiKeyToast();
          }
        }
      }

      const executionTime = getElapsedTime(operation, startTime);

      // Check if server action returned an error
      if (serverResponse.error) {
        const errorResponse = handlePlaygroundClientErrorResponse(
          serverResponse,
          {
            operation,
            label,
            executionTime,
            requestUrl,
            onRetry: handleRetry,
          },
        );

        setResponses((prev) => ({
          ...prev,
          [operation]: errorResponse,
        }));

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
          data: serverResponse.data as APISuccessResponses,
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
      const errorResponse = handleUnexpectedPlaygroundError(error, {
        operation,
        label,
        executionTime,
        requestUrl,
        onRetry: handleRetry,
      });

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
  };
}
