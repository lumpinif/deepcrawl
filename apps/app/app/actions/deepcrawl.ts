'use server';

import { DeepcrawlApp } from '@deepcrawl-sdk/ts';
import type { LinksPOSTOutput, ReadPOSTOutput } from '@deepcrawl-sdk/ts';
import {
  DeepcrawlAuthError,
  DeepcrawlError,
  DeepcrawlLinksError,
  DeepcrawlNetworkError,
  DeepcrawlReadError,
} from '@deepcrawl-sdk/ts';

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

const apiKey = '123123123';

const dc = new DeepcrawlApp({
  apiKey,
  baseUrl:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8080'
      : 'https://api.deepcrawl.dev',
});

export async function getMarkdownAction({
  url,
}: ApiCallInput): Promise<ApiResponse> {
  try {
    const data = await dc.getMarkdown(url);

    return {
      data,
      status: 200,
    };
  } catch (error) {
    console.error('getMarkdownAction error:', error);

    // Handle specific Deepcrawl errors
    if (error instanceof DeepcrawlAuthError) {
      return {
        error: error.message,
        status: 401,
        errorType: 'auth',
      };
    }

    if (error instanceof DeepcrawlReadError) {
      return {
        error: error.message,
        status: 400,
        errorType: 'read',
        targetUrl: error.targetUrl,
      };
    }

    if (error instanceof DeepcrawlNetworkError) {
      return {
        error: error.message,
        status: 503,
        errorType: 'network',
      };
    }

    if (error instanceof DeepcrawlError) {
      return {
        error: error.message,
        status: 500,
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
    const data: ReadPOSTOutput = await dc.readUrl(url);

    return {
      data,
      status: 200,
    };
  } catch (error) {
    console.error('readUrlAction error:', error);

    // Handle specific Deepcrawl errors
    if (error instanceof DeepcrawlAuthError) {
      return {
        error: error.message,
        status: 401,
        errorType: 'auth',
      };
    }

    if (error instanceof DeepcrawlReadError) {
      return {
        error: error.message,
        status: 400,
        errorType: 'read',
        targetUrl: error.targetUrl,
      };
    }

    if (error instanceof DeepcrawlNetworkError) {
      return {
        error: error.message,
        status: 503,
        errorType: 'network',
      };
    }

    if (error instanceof DeepcrawlError) {
      return {
        error: error.message,
        status: 500,
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
    const data: LinksPOSTOutput = await dc.extractLinks(url);

    return {
      data,
      status: 200,
    };
  } catch (error) {
    console.error('extractLinksAction error:', error);

    // Handle specific Deepcrawl errors
    if (error instanceof DeepcrawlAuthError) {
      return {
        error: error.message,
        status: 401,
        errorType: 'auth',
      };
    }

    if (error instanceof DeepcrawlLinksError) {
      return {
        error: error.message,
        status: 400,
        errorType: 'links',
        targetUrl: error.targetUrl,
        timestamp: error.timestamp,
      };
    }

    if (error instanceof DeepcrawlNetworkError) {
      return {
        error: error.message,
        status: 503,
        errorType: 'network',
      };
    }

    if (error instanceof DeepcrawlError) {
      return {
        error: error.message,
        status: 500,
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
