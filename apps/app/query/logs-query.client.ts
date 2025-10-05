import type { GetManyLogsResponse } from 'deepcrawl';

const LOGS_ENDPOINT = '/api/deepcrawl/logs';

export async function getManyDeepcrawlLogs(): Promise<GetManyLogsResponse> {
  const response = await fetch(LOGS_ENDPOINT, {
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
