import { toast } from 'sonner';
import type {
  DeepcrawlOperations,
  PlaygroundResponse,
} from '@/hooks/playground/types';

interface PlaygroundErrorHandlerOptions {
  operation: DeepcrawlOperations;
  label: string;
  executionTime: number;
  requestUrl: string;
  onRetry?: (operation: DeepcrawlOperations, label: string) => void;
}

export function handlePlaygroundClientErrorResponse(
  error: Omit<PlaygroundResponse<never>, 'data'>,
  options: PlaygroundErrorHandlerOptions,
): Omit<PlaygroundResponse<never>, 'data'> & {
  operation: DeepcrawlOperations;
} {
  const { operation, label, executionTime, requestUrl, onRetry } = options;

  const errorType = error.errorType ?? 'unknown';
  const errorMessage = error.error ?? 'An unknown error occurred';
  const status = error.status ?? 500;
  const targetUrl = error.targetUrl ?? requestUrl;
  const timestamp = error.timestamp ?? new Date().toISOString();
  const retryable = errorType === 'network';

  toast.error(`${label} failed`, {
    description: errorMessage,
    action:
      retryable && onRetry
        ? {
            label: 'Retry',
            onClick: () => onRetry(operation, label),
          }
        : undefined,
  });

  return {
    operation,
    status,
    executionTime,
    targetUrl,
    timestamp,
    error: errorMessage,
    errorType,
    retryable,
  };
}

export function handleUnexpectedPlaygroundError(
  error: unknown,
  options: PlaygroundErrorHandlerOptions,
): Omit<PlaygroundResponse<never>, 'data'> & {
  operation: DeepcrawlOperations;
} {
  const errorMessage =
    error instanceof Error ? error.message : 'An unknown error occurred';

  return handlePlaygroundClientErrorResponse(
    {
      error: errorMessage,
      status: 500,
      errorType: 'unknown',
    },
    options,
  );
}
