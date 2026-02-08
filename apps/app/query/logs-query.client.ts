import {
  type ExportResponseOptions,
  type ExportResponseOutput,
  type ListLogsOptions,
  type ListLogsOptionsOverrides,
  type ListLogsResponse,
  resolveListLogsOptions,
} from '@deepcrawl/contracts';
import { ensureAbsoluteUrl } from '@deepcrawl/runtime/urls';
import {
  clearStoredPlaygroundApiKey,
  getStoredPlaygroundApiKey,
} from '@/lib/playground-api-key';
import { ensurePlaygroundApiKey } from '@/lib/playground-api-key.client';
import { shouldUsePlaygroundApiKey } from '@/lib/playground-api-key-policy';
import { serializeListLogsOptions } from '@/utils/logs';

const LOGS_ENDPOINT = '/api/deepcrawl/logs';
const LOGS_EXPORT_ENDPOINT = '/api/deepcrawl/logs/export';

function resolveAppOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  const envOrigin =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    process.env.VERCEL_URL;

  if (envOrigin && envOrigin.length > 0) {
    return ensureAbsoluteUrl(envOrigin);
  }

  return 'http://localhost:3000';
}

function buildLogsEndpoint(query: string): string {
  const origin = resolveAppOrigin();

  try {
    const url = new URL(LOGS_ENDPOINT, origin);
    if (query.length > 0) {
      url.search = query;
    }
    return url.toString();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to construct logs endpoint URL', {
        error,
        origin,
        query,
      });
    }
    return query.length > 0 ? `${LOGS_ENDPOINT}?${query}` : LOGS_ENDPOINT;
  }
}

function withAuthorizationHeader(
  init: RequestInit,
  apiKey: string,
): RequestInit {
  const headers = new Headers(init.headers);
  headers.set('authorization', `Bearer ${apiKey}`);
  return { ...init, headers };
}

async function fetchWithAuthFallback(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const initial = await fetch(url, init);
  if (initial.ok) {
    return initial;
  }

  const shouldRetry = initial.status === 401 || initial.status === 403;
  if (!shouldRetry) {
    return initial;
  }

  if (!shouldUsePlaygroundApiKey()) {
    return initial;
  }

  const storedKey = getStoredPlaygroundApiKey()?.key;
  if (storedKey) {
    const withStored = await fetch(
      url,
      withAuthorizationHeader(init, storedKey),
    );
    if (withStored.ok) {
      return withStored;
    }

    const storedUnauthorized =
      withStored.status === 401 || withStored.status === 403;
    if (!storedUnauthorized) {
      return withStored;
    }

    // Stored key is likely invalid/rotated. Rotate once and retry.
    clearStoredPlaygroundApiKey();
  }

  try {
    const rotatedKey = await ensurePlaygroundApiKey();
    return await fetch(url, withAuthorizationHeader(init, rotatedKey));
  } catch {
    return initial;
  }
}

export async function listDeepcrawlLogs(
  params: ListLogsOptions | ListLogsOptionsOverrides = {},
): Promise<ListLogsResponse> {
  const resolvedParams = resolveListLogsOptions(params);

  const searchParams = serializeListLogsOptions(resolvedParams);
  const query = searchParams.toString();
  const endpoint = buildLogsEndpoint(query);

  const response = await fetchWithAuthFallback(endpoint, {
    credentials: 'include',
    cache: 'no-store', // Disable Next.js fetch cache to ensure cookies are always sent
  });

  if (!response.ok) {
    let message = 'Failed to fetch Deepcrawl logs';
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.error === 'string') {
        message = errorBody.error;
      }
    } catch (parseError) {
      console.warn(
        'Failed to parse Deepcrawl logs error response:',
        parseError,
      );
    }

    throw new Error(message);
  }

  const data = (await response.json()) as ListLogsResponse;
  return data;
}

export async function exportLogResponse(
  options: ExportResponseOptions,
): Promise<ExportResponseOutput> {
  const { id, format } = options;

  const searchParams = new URLSearchParams({
    id,
    format,
  });

  const origin = resolveAppOrigin();
  const url = new URL(LOGS_EXPORT_ENDPOINT, origin);
  url.search = searchParams.toString();

  const response = await fetchWithAuthFallback(url.toString(), {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = 'Failed to export log response';
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.error === 'string') {
        message = errorBody.error;
      }
    } catch (parseError) {
      console.warn('Failed to parse export error response:', parseError);
    }

    throw new Error(message);
  }

  const data = (await response.json()) as ExportResponseOutput;
  return data;
}
