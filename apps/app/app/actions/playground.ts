'use server';

import {
  DeepcrawlApp,
  DeepcrawlAuthError,
  DeepcrawlError,
  DeepcrawlLinksError,
  DeepcrawlNetworkError,
  DeepcrawlReadError,
  type ExtractLinksOptions,
  type ExtractLinksResponse,
  type GetMarkdownOptions,
  type GetMarkdownResponse,
  type ReadUrlOptions,
  type ReadUrlResponse,
} from 'deepcrawl';
import { headers } from 'next/headers';

interface PlaygroundApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status?: number;
  errorType?: 'auth' | 'network' | 'read' | 'links' | 'unknown';
  targetUrl?: string;
  timestamp?: string;
}

const DEEPCRAWL_BASE_URL = process.env.NEXT_PUBLIC_DEEPCRAWL_API_URL as string;

/**
 * Create Deepcrawl client with proper auth header forwarding
 */
async function createPlaygroundClient() {
  const requestHeaders = await headers();

  return new DeepcrawlApp({
    baseUrl: DEEPCRAWL_BASE_URL,
    headers: requestHeaders,
  });
}

/**
 * Server Action: Get Markdown from URL
 */
export async function playgroundGetMarkdown(
  options: GetMarkdownOptions,
): Promise<PlaygroundApiResponse<GetMarkdownResponse>> {
  try {
    const dc = await createPlaygroundClient();
    const data = await dc.getMarkdown(options);

    return {
      data,
      status: 200,
    };
  } catch (error) {
    return handlePlaygroundError<GetMarkdownResponse>(error);
  }
}

/**
 * Server Action: Read URL
 */
export async function playgroundReadUrl(
  options: ReadUrlOptions,
): Promise<PlaygroundApiResponse<ReadUrlResponse>> {
  try {
    const dc = await createPlaygroundClient();
    const data = await dc.readUrl(options);

    return {
      data,
      status: 200,
    };
  } catch (error) {
    return handlePlaygroundError<ReadUrlResponse>(error);
  }
}

/**
 * Server Action: Extract Links
 */
export async function playgroundExtractLinks(
  options: ExtractLinksOptions,
): Promise<PlaygroundApiResponse<ExtractLinksResponse>> {
  try {
    const dc = await createPlaygroundClient();
    const data = await dc.extractLinks(options);

    return {
      data,
      status: 200,
    };
  } catch (error) {
    return handlePlaygroundError<ExtractLinksResponse>(error);
  }
}

/**
 * Unified error handler for playground operations
 */
function handlePlaygroundError<T = unknown>(
  error: unknown,
): PlaygroundApiResponse<T> {
  if (error instanceof DeepcrawlAuthError) {
    return {
      error: error.message,
      status: error.status,
      errorType: 'auth',
    };
  }

  if (error instanceof DeepcrawlReadError) {
    return {
      error: error.message,
      status: error.status,
      errorType: 'read',
      targetUrl: error.targetUrl,
    };
  }

  if (error instanceof DeepcrawlLinksError) {
    return {
      error: error.message,
      status: error.status,
      errorType: 'links',
      targetUrl: error.targetUrl,
      timestamp: error.timestamp,
    };
  }

  if (error instanceof DeepcrawlNetworkError) {
    return {
      error: error.message,
      status: error.status,
      errorType: 'network',
    };
  }

  if (error instanceof DeepcrawlError) {
    return {
      error: error.message,
      status: error.status,
      errorType: 'unknown',
    };
  }

  return {
    error: error instanceof Error ? error.message : 'An unknown error occurred',
    status: 500,
    errorType: 'unknown',
  };
}
