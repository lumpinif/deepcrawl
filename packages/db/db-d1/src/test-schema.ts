/**
 * Schema validation test with sample data
 * This file validates that our database schema correctly handles
 * real data structures from the API endpoints
 *
 * Note: This uses TypeScript types that match the expected API response structures
 * without importing the actual Zod schemas to avoid dependency issues
 */

import type { linksResponse, readResponse } from './db/schema';

// Type definitions matching the API schemas (without importing @deepcrawl/types)
interface ReadOptions {
  url: string;
  markdown?: boolean;
  rawHtml?: boolean;
  cacheOptions?: {
    expirationTtl?: number;
    expiration?: number;
  };
}

interface ReadSuccessResponse {
  success: true;
  cached?: boolean;
  targetUrl: string;
  title?: string;
  description?: string;
  markdown?: string;
  rawHtml?: string;
  cleanedHtml?: string;
  metadata?: Record<string, any>;
  metaFiles?: Record<string, any>;
  metrics?: {
    duration?: number;
    readableDuration?: string;
    startTime?: number;
    endTime?: number;
  };
}

interface ReadErrorResponse {
  success: false;
  targetUrl: string;
  error: string;
}

interface LinksOptions {
  url: string;
  tree?: boolean;
  linkExtractionOptions?: Record<string, any>;
}

interface LinksSuccessResponse {
  success: true;
  targetUrl: string;
  timestamp: string;
  cached?: boolean;
  executionTime?: string;
  title?: string;
  description?: string;
  cleanedHtml?: string;
  metadata?: Record<string, any>;
  metaFiles?: Record<string, any>;
  ancestors?: string[];
  skippedUrls?: Record<string, any>;
  extractedLinks?: {
    internal?: string[];
    external?: string[];
    media?: {
      images?: string[];
      videos?: string[];
      documents?: string[];
    };
  };
  tree?: {
    url: string;
    rootUrl: string;
    name: string;
    totalUrls: number;
    executionTime: string;
    lastUpdated: string;
    children: any[];
  };
}

// Sample data that would come from actual API calls
const sampleReadRequest: ReadOptions = {
  url: 'https://example.com/article',
  markdown: true,
  rawHtml: false,
  cacheOptions: {
    expirationTtl: 3600,
  },
};

const sampleReadSuccessResponse: ReadSuccessResponse = {
  success: true,
  cached: false,
  targetUrl: 'https://example.com/article',
  title: 'Example Article',
  description: 'This is an example article',
  markdown: '# Example Article\n\nThis is the content...',
  metadata: {
    title: 'Example Article',
    description: 'This is an example article',
    language: 'en',
    canonical: 'https://example.com/article',
  },
  metrics: {
    duration: 1500,
    readableDuration: '1.5s',
    startTime: Date.now() - 1500,
    endTime: Date.now(),
  },
};

const sampleReadErrorResponse: ReadErrorResponse = {
  success: false,
  targetUrl: 'https://example.com/not-found',
  error: 'Failed to fetch: 404 Not Found',
};

const sampleLinksRequest: LinksOptions = {
  url: 'https://example.com',
  tree: true,
  linkExtractionOptions: {
    extractMedia: true,
    extractExternal: true,
  },
};

const sampleLinksSuccessResponse: LinksSuccessResponse = {
  success: true,
  targetUrl: 'https://example.com',
  timestamp: new Date().toISOString(),
  cached: false,
  executionTime: '2.1s',
  title: 'Example Homepage',
  extractedLinks: {
    internal: ['https://example.com/about', 'https://example.com/contact'],
    external: ['https://external-site.com'],
    media: {
      images: ['https://example.com/logo.png'],
      videos: [],
      documents: [],
    },
  },
  tree: {
    url: 'https://example.com',
    rootUrl: 'https://example.com',
    name: 'Example',
    totalUrls: 25,
    executionTime: '2.1s',
    lastUpdated: new Date().toISOString(),
    children: [],
  },
};

// Test data mapping to database schema
export function mapReadSuccessToDb(
  request: ReadOptions,
  response: ReadSuccessResponse,
  userId?: string,
  method: 'getMarkdown' | 'readUrl' = 'readUrl',
): typeof readResponse.$inferInsert {
  return {
    id: crypto.randomUUID(),
    userId,
    method,
    success: response.success,
    targetUrl: response.targetUrl,
    requestUrl: request.url,
    requestOptions: JSON.stringify(request),

    // Response fields (success case)
    cached: response.cached,
    title: response.title,
    description: response.description,
    markdown: response.markdown,
    rawHtml: response.rawHtml,
    cleanedHtml: response.cleanedHtml,
    metadata: response.metadata ? JSON.stringify(response.metadata) : null,
    metaFiles: response.metaFiles ? JSON.stringify(response.metaFiles) : null,
    metrics: response.metrics ? JSON.stringify(response.metrics) : null,

    // Performance tracking
    executionTimeMs: response.metrics?.duration,

    // Error fields (null for success)
    error: null,
  };
}

export function mapReadErrorToDb(
  request: ReadOptions,
  response: ReadErrorResponse,
  userId?: string,
  method: 'getMarkdown' | 'readUrl' = 'readUrl',
): typeof readResponse.$inferInsert {
  return {
    id: crypto.randomUUID(),
    userId,
    method,
    success: response.success,
    targetUrl: response.targetUrl,
    requestUrl: request.url,
    requestOptions: JSON.stringify(request),

    // Success fields (null for error)
    cached: null,
    title: null,
    description: null,
    markdown: null,
    rawHtml: null,
    cleanedHtml: null,
    metadata: null,
    metaFiles: null,
    metrics: null,
    executionTimeMs: null,

    // Error fields
    error: response.error,
  };
}

export function mapLinksSuccessToDb(
  request: LinksOptions,
  response: LinksSuccessResponse,
  userId?: string,
  method: 'getLinks' | 'extractLinks' = 'extractLinks',
): typeof linksResponse.$inferInsert {
  return {
    id: crypto.randomUUID(),
    userId,
    method,
    success: response.success,
    targetUrl: response.targetUrl,
    timestamp: response.timestamp,
    requestUrl: request.url,
    requestOptions: JSON.stringify(request),

    // Response fields (success case)
    cached: response.cached,
    executionTime: response.executionTime,
    title: response.title,
    description: response.description,
    cleanedHtml: response.cleanedHtml,
    metadata: response.metadata ? JSON.stringify(response.metadata) : null,
    metaFiles: response.metaFiles ? JSON.stringify(response.metaFiles) : null,
    ancestors: response.ancestors ? JSON.stringify(response.ancestors) : null,
    skippedUrls: response.skippedUrls
      ? JSON.stringify(response.skippedUrls)
      : null,
    extractedLinks: response.extractedLinks
      ? JSON.stringify(response.extractedLinks)
      : null,
    tree: response.tree ? JSON.stringify(response.tree) : null,

    // Performance tracking
    executionTimeMs: response.executionTime
      ? Number.parseInt(response.executionTime.replace(/[^\d]/g, ''))
      : null,
    totalUrls: response.tree?.totalUrls || null,

    // Error fields (null for success)
    error: null,
  };
}

// Export sample data for testing
export const testData = {
  readRequest: sampleReadRequest,
  readSuccess: sampleReadSuccessResponse,
  readError: sampleReadErrorResponse,
  linksRequest: sampleLinksRequest,
  linksSuccess: sampleLinksSuccessResponse,
};
