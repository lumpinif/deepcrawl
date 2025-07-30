import {
  DeepcrawlError,
  DeepcrawlLinksError,
  DeepcrawlRateLimitError,
  DeepcrawlReadError,
} from 'deepcrawl';
import { toast } from 'sonner';
import type {
  DeepcrawlOperations,
  PlaygroundResponse,
} from '@/components/playground/playground-client';

export interface ErrorHandlerOptions {
  operation: DeepcrawlOperations;
  label: string;
  executionTime: number;
  onRetry: (operation: DeepcrawlOperations, label: string) => void;
}

export const handlePlaygroundError = (
  error: unknown,
  options: ErrorHandlerOptions,
): PlaygroundResponse => {
  if (error instanceof DeepcrawlError) {
    return handleDeepcrawlError(error, options);
  }

  return handleGenericError(error, options.executionTime, options.label);
};

const handleDeepcrawlError = (
  error: DeepcrawlError,
  options: ErrorHandlerOptions,
): PlaygroundResponse => {
  const { operation, label, executionTime, onRetry } = options;

  // Handle specific error types first
  if (error instanceof DeepcrawlReadError) {
    return handleReadError(error, executionTime, operation, label, onRetry);
  }

  if (error instanceof DeepcrawlLinksError) {
    return handleLinksError(error, executionTime, operation, label, onRetry);
  }

  if (error instanceof DeepcrawlRateLimitError) {
    return handleRateLimitError(
      error,
      executionTime,
      operation,
      label,
      onRetry,
    );
  }

  // Handle categorized errors using static type guards
  if (DeepcrawlError.isAuthError(error)) {
    return handleAuthError(error, executionTime);
  }

  if (DeepcrawlError.isValidationError(error)) {
    return handleValidationError(error, executionTime);
  }

  if (DeepcrawlError.isNetworkError(error)) {
    return handleNetworkError(error, executionTime, operation, label, onRetry);
  }

  // Fallback to server error for any remaining DeepcrawlError instances
  return handleServerError(error, executionTime, label);
};

const handleReadError = (
  error: DeepcrawlReadError,
  executionTime: number,
  operation: DeepcrawlOperations,
  label: string,
  onRetry: (operation: DeepcrawlOperations, label: string) => void,
): PlaygroundResponse => {
  const response: PlaygroundResponse = {
    error: error.message,
    userMessage: error.userMessage,
    status: error.status,
    executionTime,
    errorType: 'read',
    targetUrl: error.targetUrl,
    retryable: false,
  };

  toast.error(`Read failed: ${error.userMessage}`, {
    description: `invalid input: ${error.targetUrl}`,
    action: {
      label: 'Retry',
      onClick: () => onRetry(operation, label),
    },
  });

  return response;
};

const handleLinksError = (
  error: DeepcrawlLinksError,
  executionTime: number,
  operation: DeepcrawlOperations,
  label: string,
  onRetry: (operation: DeepcrawlOperations, label: string) => void,
): PlaygroundResponse => {
  const response: PlaygroundResponse = {
    error: error.message,
    userMessage: error.userMessage,
    status: error.status,
    executionTime,
    errorType: 'links',
    targetUrl: error.targetUrl,
    timestamp: error.timestamp,
    retryable: false,
  };

  toast.error(`Links extraction failed: ${error.userMessage}`, {
    description: `invalid input: ${error.targetUrl}`,
    action: {
      label: 'Retry',
      onClick: () => onRetry(operation, label),
    },
  });

  return response;
};

const handleRateLimitError = (
  error: DeepcrawlRateLimitError,
  executionTime: number,
  operation: DeepcrawlOperations,
  label: string,
  onRetry: (operation: DeepcrawlOperations, label: string) => void,
): PlaygroundResponse => {
  const response: PlaygroundResponse = {
    error: error.message,
    userMessage: error.userMessage,
    status: error.status,
    executionTime,
    errorType: 'rateLimit',
    retryable: true,
    retryAfter: error.retryAfter,
  };

  toast.error(`Rate limited: ${error.userMessage}`, {
    description: `Retry after ${error.retryAfter} seconds`,
    action: {
      label: `Retry in ${error.retryAfter}s`,
      onClick: () => {
        setTimeout(() => {
          onRetry(operation, label);
        }, error.retryAfter * 1000);
      },
    },
  });

  return response;
};

const handleAuthError = (
  error: DeepcrawlError,
  executionTime: number,
): PlaygroundResponse => {
  const response: PlaygroundResponse = {
    error: error.message,
    userMessage: error.userMessage,
    status: error.status,
    executionTime,
    errorType: 'auth',
    retryable: false,
  };

  toast.error(`Authentication failed: ${error.userMessage}`, {
    description: 'Please check your API key',
  });

  return response;
};

const handleValidationError = (
  error: DeepcrawlError,
  executionTime: number,
): PlaygroundResponse => {
  const response: PlaygroundResponse = {
    error: error.message,
    userMessage: error.userMessage,
    status: error.status,
    executionTime,
    errorType: 'validation',
    retryable: false,
  };

  toast.error(`Validation error: ${error.userMessage}`, {
    description: 'Please check your request parameters',
  });

  return response;
};

const handleNetworkError = (
  error: DeepcrawlError,
  executionTime: number,
  operation: DeepcrawlOperations,
  label: string,
  onRetry: (operation: DeepcrawlOperations, label: string) => void,
): PlaygroundResponse => {
  const response: PlaygroundResponse = {
    error: error.message,
    userMessage: error.userMessage,
    status: error.status,
    executionTime,
    errorType: 'network',
    retryable: true,
  };

  toast.error(`Network error: ${error.userMessage}`, {
    description: 'Please check your connection and try again',
    action: {
      label: 'Retry',
      onClick: () => onRetry(operation, label),
    },
  });

  return response;
};

const handleServerError = (
  error: DeepcrawlError,
  executionTime: number,
  label: string,
): PlaygroundResponse => {
  const isNetworkError = error.isNetwork();
  const isRateLimitError = error.isRateLimit();

  const response: PlaygroundResponse = {
    error: error.message,
    userMessage: error.userMessage || error.message,
    status: error.status,
    executionTime,
    errorType: 'server',
    retryable: isNetworkError || isRateLimitError,
    retryAfter: DeepcrawlError.isRateLimitError(error)
      ? error.retryAfter
      : undefined,
  };

  toast.error(`${label} failed: ${error.userMessage || error.message}`);
  return response;
};

const handleGenericError = (
  error: unknown,
  executionTime: number,
  label: string,
): PlaygroundResponse => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const response: PlaygroundResponse = {
    error: errorMessage,
    userMessage: errorMessage,
    status: 500,
    executionTime,
    errorType: 'unknown',
    retryable: false,
  };

  toast.error(`${label} failed: ${errorMessage}`);
  return response;
};
