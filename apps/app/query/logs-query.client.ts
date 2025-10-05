import type { GetManyLogsResponse } from 'deepcrawl';
import { deepcrawlClient } from '@/lib/deepcrawl';

/**
 * Deepcrawl SDK Client API Call:
 */
export async function getManyDeepcrawlLogs(): Promise<GetManyLogsResponse> {
  try {
    const result: GetManyLogsResponse = await deepcrawlClient.getManyLogs();

    return result;
  } catch (error) {
    console.error('Failed to fetch Deepcrawl logs:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch Deepcrawl logs',
    );
  }
}
