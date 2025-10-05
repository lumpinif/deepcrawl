'use server';

import {
  DeepcrawlApp,
  DeepcrawlAuthError,
  DeepcrawlError,
  DeepcrawlLinksError,
  DeepcrawlNetworkError,
  DeepcrawlReadError,
} from 'deepcrawl';
import { headers } from 'next/headers';

interface ApiCallInput {
  url: string;
}

interface ApiResponse {
  data?: unknown;
  error?: string;
  status?: number;
  errorType?: 'auth' | 'network' | 'read' | 'links' | 'unknown';
  targetUrl?: string;
  timestamp?: string;
}

const DEEPCRAWL_BASE_URL = process.env.NEXT_PUBLIC_DEEPCRAWL_API_URL as string;

async function createDeepcrawlClient() {
  const requestHeaders = await headers();

  const client = new DeepcrawlApp({
    baseUrl: DEEPCRAWL_BASE_URL,
    headers: requestHeaders, // SDK automatically extracts only auth headers
  });

  return client;
}

export async function getMarkdownAction({
  url,
}: ApiCallInput): Promise<ApiResponse> {
  try {
    const dc = await createDeepcrawlClient();

    const data = await dc.getMarkdown(url);

    return {
      data,
      status: 200,
    };
  } catch (error) {
    // Handle specific Deepcrawl errors
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

    // Handle unknown errors
    return {
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
      status: 500,
      errorType: 'unknown',
    };
  }
}

export async function readUrlAction({
  url,
}: ApiCallInput): Promise<ApiResponse> {
  try {
    const dc = await createDeepcrawlClient();

    const data = await dc.readUrl(url);

    return {
      data,
      status: 200,
    };
  } catch (error) {
    // Handle specific Deepcrawl errors
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

    // Handle unknown errors
    return {
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
      status: 500,
      errorType: 'unknown',
    };
  }
}

export async function extractLinksAction({
  url,
}: ApiCallInput): Promise<ApiResponse> {
  try {
    const dc = await createDeepcrawlClient();

    const data = await dc.extractLinks(url);

    return {
      data,
      status: 200,
    };
  } catch (error) {
    // Handle specific Deepcrawl errors
    if (error instanceof DeepcrawlAuthError) {
      return {
        error: error.message,
        status: error.status,
        errorType: 'auth',
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

    // Handle unknown errors
    return {
      error:
        error instanceof Error ? error.message : 'An unknown error occurred',
      status: 500,
      errorType: 'unknown',
    };
  }
}
