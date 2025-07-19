'use server';

import type { LinksPOSTOutput, ReadPOSTOutput } from 'deepcrawl';
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

const apiKey =
  process.env.DEEP_CRAWL_API_KEY ?? 'use_header_auth_instead_api_key';

async function createDeepcrawlClient() {
  return new DeepcrawlApp({
    apiKey,
    baseUrl:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080'
        : 'https://api.deepcrawl.dev',
    headers: await headers(), // SDK automatically extracts only auth headers
  });
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
    const data: ReadPOSTOutput = await dc.readUrl(url);

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
    const data: LinksPOSTOutput = await dc.extractLinks(url);

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
