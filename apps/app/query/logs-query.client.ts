import { DeepcrawlApp, type GetManyLogsResponse } from 'deepcrawl';

const DEEPCRAWL_API_KEY = process.env.NEXT_PUBLIC_DEEPCRAWL_API_KEY as string;
const dc = new DeepcrawlApp({ apiKey: DEEPCRAWL_API_KEY });

/**
 * Deepcrawl SDK Client API Call:
 */
export async function getManyDeepcrawlLogs(): Promise<GetManyLogsResponse> {
  try {
    const result: GetManyLogsResponse = await dc.getManyLogs();

    return result;
  } catch (error) {
    console.error('Failed to fetch Deepcrawl logs:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to fetch Deepcrawl logs',
    );
  }
}
