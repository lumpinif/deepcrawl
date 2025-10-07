import type { GetManyLogsResponse } from '@deepcrawl/contracts';
import { normalizeActivityLogsPagination } from '@deepcrawl/types/routers/logs';
import {
  type ActivityLogsQueryParams,
  DEFAULT_ACTIVITY_LOGS_QUERY_PARAMS,
} from './logs-query.shared';

const LOGS_ENDPOINT = '/api/deepcrawl/logs';

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

export async function getManyDeepcrawlLogs(
  params: ActivityLogsQueryParams = DEFAULT_ACTIVITY_LOGS_QUERY_PARAMS,
): Promise<GetManyLogsResponse> {
  const searchParams = new URLSearchParams();
  const { limit: normalizedLimit, offset: normalizedOffset } =
    normalizeActivityLogsPagination(params);

  if (normalizedLimit !== undefined) {
    searchParams.set('limit', normalizedLimit.toString());
  }

  if (normalizedOffset !== undefined) {
    searchParams.set('offset', normalizedOffset.toString());
  }

  if (params.path !== undefined) {
    searchParams.set('path', params.path);
  }

  if (params.success !== undefined) {
    searchParams.set('success', String(params.success));
  }

  if (params.startDate !== undefined) {
    searchParams.set('startDate', params.startDate);
  }

  if (params.endDate !== undefined) {
    searchParams.set('endDate', params.endDate);
  }

  const query = searchParams.toString();
  const endpoint = buildLogsEndpoint(query);

  const response = await fetch(endpoint, {
    credentials: 'include',
    cache: 'no-store',
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

  const data = (await response.json()) as GetManyLogsResponse;
  return data;
}
