'use server';

import { DeepcrawlApp } from '@deepcrawl-sdk/ts';

interface DeepCrawlParams {
  url: string;
  apiKey: string;
}

// Type for Speakeasy-generated errors based on documentation
interface SpeakeasyError extends Error {
  statusCode: number;
  body: string;
  headers: Headers;
  data$?: {
    success: boolean;
    targetUrl: string;
    error: string;
    timestamp?: string;
    tree?: unknown;
  };
}

// Type guard for Speakeasy errors
function isSpeakeasyError(error: unknown): error is SpeakeasyError {
  return (
    error instanceof Error &&
    'statusCode' in error &&
    typeof (error as SpeakeasyError).statusCode === 'number'
  );
}

export async function getMarkdownAction({ url, apiKey }: DeepCrawlParams) {
  try {
    if (!url.trim()) {
      return { error: 'URL is required', status: 400 };
    }

    if (!apiKey.trim()) {
      return { error: 'API key is required', status: 400 };
    }

    const deepcrawlApp = new DeepcrawlApp({
      bearer: `Bearer ${apiKey}`,
    });

    const result = await deepcrawlApp.getMarkdown({ url });

    return { data: result, status: 200 };
  } catch (error: unknown) {
    // Handle Speakeasy-generated errors with proper type safety
    if (isSpeakeasyError(error)) {
      // Extract structured data if available
      if (error.data$) {
        return {
          error: error.data$.error,
          status: error.statusCode,
          targetUrl: error.data$.targetUrl,
          success: error.data$.success,
        };
      }

      // Fallback for Speakeasy errors without structured data
      return {
        error: error.message,
        status: error.statusCode,
        body: error.body,
      };
    }

    // Handle standard errors
    if (error instanceof Error) {
      // Check for network/timeout errors by name
      if (error.name === 'ConnectionError') {
        return { error: 'Network connection failed', status: 503 };
      }

      if (error.name === 'RequestTimeoutError') {
        return { error: 'Request timed out', status: 408 };
      }

      if (error.name === 'ResponseValidationError') {
        return { error: 'Invalid response from server', status: 502 };
      }

      return { error: error.message, status: 500 };
    }

    // Fallback for unexpected errors
    return { error: 'An unexpected error occurred', status: 500 };
  }
}

export async function readUrlAction({ url, apiKey }: DeepCrawlParams) {
  try {
    if (!url.trim()) {
      return { error: 'URL is required', status: 400 };
    }

    if (!apiKey.trim()) {
      return { error: 'API key is required', status: 400 };
    }

    const deepcrawlApp = new DeepcrawlApp({
      bearer: `Bearer ${apiKey}`,
    });

    const result = await deepcrawlApp.readUrl({ url });

    return { data: result, status: 200 };
  } catch (error: unknown) {
    // Handle Speakeasy-generated errors with proper type safety
    if (isSpeakeasyError(error)) {
      // Extract structured data if available
      if (error.data$) {
        return {
          error: error.data$.error,
          status: error.statusCode,
          targetUrl: error.data$.targetUrl,
          success: error.data$.success,
        };
      }

      // Fallback for Speakeasy errors without structured data
      return {
        error: error.message,
        status: error.statusCode,
        body: error.body,
      };
    }

    // Handle standard errors
    if (error instanceof Error) {
      // Check for network/timeout errors by name
      if (error.name === 'ConnectionError') {
        return { error: 'Network connection failed', status: 503 };
      }

      if (error.name === 'RequestTimeoutError') {
        return { error: 'Request timed out', status: 408 };
      }

      if (error.name === 'ResponseValidationError') {
        return { error: 'Invalid response from server', status: 502 };
      }

      return { error: error.message, status: 500 };
    }

    // Fallback for unexpected errors
    return { error: 'An unexpected error occurred', status: 500 };
  }
}

export async function extractLinksAction({ url, apiKey }: DeepCrawlParams) {
  try {
    if (!url.trim()) {
      return { error: 'URL is required', status: 400 };
    }

    if (!apiKey.trim()) {
      return { error: 'API key is required', status: 400 };
    }

    const deepcrawlApp = new DeepcrawlApp({
      bearer: `Bearer ${apiKey}`,
    });

    const result = await deepcrawlApp.extractLinks({ url });

    return { data: result, status: 200 };
  } catch (error: unknown) {
    // Handle Speakeasy-generated errors with proper type safety
    if (isSpeakeasyError(error)) {
      // Extract structured data if available
      if (error.data$) {
        const response: {
          error: string;
          status: number;
          targetUrl: string;
          success: boolean;
          timestamp?: string;
          tree?: unknown;
        } = {
          error: error.data$.error,
          status: error.statusCode,
          targetUrl: error.data$.targetUrl,
          success: error.data$.success,
        };

        // Add optional fields for links-specific errors
        if (error.data$.timestamp) {
          response.timestamp = error.data$.timestamp;
        }
        if (error.data$.tree) {
          response.tree = error.data$.tree;
        }

        return response;
      }

      // Fallback for Speakeasy errors without structured data
      return {
        error: error.message,
        status: error.statusCode,
        body: error.body,
      };
    }

    // Handle standard errors
    if (error instanceof Error) {
      // Check for network/timeout errors by name
      if (error.name === 'ConnectionError') {
        return { error: 'Network connection failed', status: 503 };
      }

      if (error.name === 'RequestTimeoutError') {
        return { error: 'Request timed out', status: 408 };
      }

      if (error.name === 'ResponseValidationError') {
        return { error: 'Invalid response from server', status: 502 };
      }

      return { error: error.message, status: 500 };
    }

    // Fallback for unexpected errors
    return { error: 'An unexpected error occurred', status: 500 };
  }
}
