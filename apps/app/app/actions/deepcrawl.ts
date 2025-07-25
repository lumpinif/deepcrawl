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

const apiKey =
  process.env.DEEP_CRAWL_API_KEY ?? 'USE_COOKIE_AUTH_INSTEAD_OF_API_KEY';

async function createDeepcrawlClient() {
  const clientCreationStart = Date.now();

  // Track headers() timing specifically
  const headersStart = Date.now();
  const requestHeaders = await headers();
  const headersTime = Date.now() - headersStart;

  // Track client instantiation timing
  const clientInstantiationStart = Date.now();
  const client = new DeepcrawlApp({
    apiKey,
    baseUrl:
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080'
        : 'https://api.deepcrawl.dev',
    headers: requestHeaders, // SDK automatically extracts only auth headers
  });
  const clientInstantiationTime = Date.now() - clientInstantiationStart;

  const totalClientCreationTime = Date.now() - clientCreationStart;

  console.log('[PERF] createDeepcrawlClient timing:', {
    headersTime,
    clientInstantiationTime,
    totalClientCreationTime,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });

  return client;
}

export async function getMarkdownAction({
  url,
}: ApiCallInput): Promise<ApiResponse> {
  const actionStart = Date.now();

  try {
    console.log('[PERF] getMarkdownAction started:', {
      url,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });

    // Track client creation timing
    const clientCreationStart = Date.now();
    const dc = await createDeepcrawlClient();
    const clientCreationTime = Date.now() - clientCreationStart;

    // Track SDK call timing
    const sdkCallStart = Date.now();
    const data = await dc.getMarkdown(url);
    const sdkCallTime = Date.now() - sdkCallStart;

    const totalActionTime = Date.now() - actionStart;

    console.log('[PERF] getMarkdownAction completed:', {
      url,
      clientCreationTime,
      sdkCallTime,
      totalActionTime,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });

    return {
      data,
      status: 200,
    };
  } catch (error) {
    const errorTime = Date.now() - actionStart;

    console.error('[PERF] getMarkdownAction error:', {
      url,
      errorTime,
      errorType: error?.constructor?.name,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });

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
  const actionStart = Date.now();

  try {
    console.log('[PERF] readUrlAction started:', {
      url,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });

    // Track client creation timing
    const clientCreationStart = Date.now();
    const dc = await createDeepcrawlClient();
    const clientCreationTime = Date.now() - clientCreationStart;

    // Track SDK call timing
    const sdkCallStart = Date.now();
    const data = await dc.readUrl(url);
    const sdkCallTime = Date.now() - sdkCallStart;

    const totalActionTime = Date.now() - actionStart;

    console.log('[PERF] readUrlAction completed:', {
      url,
      clientCreationTime,
      sdkCallTime,
      totalActionTime,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });

    return {
      data,
      status: 200,
    };
  } catch (error) {
    const errorTime = Date.now() - actionStart;

    console.error('[PERF] readUrlAction error:', {
      url,
      errorTime,
      errorType: error?.constructor?.name,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });

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
  const actionStart = Date.now();

  try {
    console.log('[PERF] extractLinksAction started:', {
      url,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });

    // Track client creation timing
    const clientCreationStart = Date.now();
    const dc = await createDeepcrawlClient();
    const clientCreationTime = Date.now() - clientCreationStart;

    // Track SDK call timing
    const sdkCallStart = Date.now();
    const data = await dc.extractLinks(url);
    const sdkCallTime = Date.now() - sdkCallStart;

    const totalActionTime = Date.now() - actionStart;

    console.log('[PERF] extractLinksAction completed:', {
      url,
      clientCreationTime,
      sdkCallTime,
      totalActionTime,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });

    return {
      data,
      status: 200,
    };
  } catch (error) {
    const errorTime = Date.now() - actionStart;

    console.error('[PERF] extractLinksAction error:', {
      url,
      errorTime,
      errorType: error?.constructor?.name,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });

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
