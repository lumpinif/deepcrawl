'use server';

import type {
  ExtractLinksOptions,
  ExtractLinksResponse,
  GetMarkdownOptions,
  GetMarkdownResponse,
  ReadUrlOptions,
  ReadUrlResponse,
} from '@deepcrawl/contracts';
import { DeepcrawlApp } from 'deepcrawl';
import {
  DeepcrawlAuthError,
  DeepcrawlError,
  DeepcrawlLinksError,
  DeepcrawlNetworkError,
  DeepcrawlReadError,
} from 'deepcrawl/types';
import { headers } from 'next/headers';
import type { PlaygroundResponse } from '@/hooks/playground/types';
import { buildDeepcrawlHeaders } from '@/lib/auth-mode';

const DEEPCRAWL_BASE_URL = process.env.NEXT_PUBLIC_DEEPCRAWL_API_URL as string;

async function callWithAuthFallback<T>({
  apiKey,
  call,
}: {
  apiKey?: string;
  call: (dc: DeepcrawlApp) => Promise<T>;
}): Promise<T> {
  const requestHeaders = await headers();

  // 1) Prefer cookie session (or server-side JWT if configured via env).
  const sessionClient = new DeepcrawlApp({
    baseUrl: DEEPCRAWL_BASE_URL,
    headers: buildDeepcrawlHeaders(requestHeaders),
  });

  try {
    return await call(sessionClient);
  } catch (error) {
    // 2) Fallback to device-stored playground API key.
    if (apiKey && error instanceof DeepcrawlAuthError) {
      const keyClient = new DeepcrawlApp({
        baseUrl: DEEPCRAWL_BASE_URL,
        apiKey,
      });
      return await call(keyClient);
    }

    throw error;
  }
}

/**
 * Server Action: Get Markdown from URL
 */
export async function playgroundGetMarkdown(
  options: GetMarkdownOptions,
  apiKey?: string,
): Promise<PlaygroundResponse<GetMarkdownResponse>> {
  try {
    const data = await callWithAuthFallback({
      apiKey,
      call: (dc) => dc.getMarkdown(options),
    });

    return { data }; // must return in object to match the `data` property in PlaygroundResponse type
  } catch (error) {
    return handlePlaygroundAPIError(error);
  }
}

/**
 * Server Action: Read URL
 */
export async function playgroundReadUrl(
  options: ReadUrlOptions,
  apiKey?: string,
): Promise<PlaygroundResponse<ReadUrlResponse>> {
  try {
    const data = await callWithAuthFallback({
      apiKey,
      call: (dc) => dc.readUrl(options),
    });

    return { data }; // must return in object to match the `data` property in PlaygroundResponse type
  } catch (error) {
    return handlePlaygroundAPIError(error);
  }
}

/**
 * Server Action: Extract Links
 */
export async function playgroundExtractLinks(
  options: ExtractLinksOptions,
  apiKey?: string,
): Promise<PlaygroundResponse<ExtractLinksResponse>> {
  try {
    const data = await callWithAuthFallback({
      apiKey,
      call: (dc) => dc.extractLinks(options),
    });

    return { data }; // must return in object to match the `data` property in PlaygroundResponse type
  } catch (error) {
    return handlePlaygroundAPIError(error);
  }
}

/**
 * Unified error handler for playground operations
 */
function handlePlaygroundAPIError(
  error: unknown,
): Omit<PlaygroundResponse<never>, 'data'> {
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
