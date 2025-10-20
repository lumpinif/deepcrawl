import {
  type ExportResponseOptions,
  type ExportResponseOutput,
  type ListLogsOptions,
  type ListLogsOptionsOverrides,
  type ListLogsResponse,
  resolveListLogsOptions,
} from '@deepcrawl/contracts';
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
    const hasProtocol =
      envOrigin.startsWith('http://') || envOrigin.startsWith('https://');
    return hasProtocol ? envOrigin : `https://${envOrigin}`;
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

export async function listDeepcrawlLogs(
  params: ListLogsOptions | ListLogsOptionsOverrides = {},
): Promise<ListLogsResponse> {
  const resolvedParams = resolveListLogsOptions(params);

  const searchParams = serializeListLogsOptions(resolvedParams);
  const query = searchParams.toString();
  const endpoint = buildLogsEndpoint(query);

  const response = await fetch(endpoint, {
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

  const response = await fetch(url.toString(), {
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
