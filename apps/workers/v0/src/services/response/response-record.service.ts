import { eq, type NewResponseRecord, responseRecord } from '@deepcrawl/db-d1';
import type {
  LinksResponse,
  LinksSuccessResponse,
} from '@deepcrawl/types/routers/links/types';
import type {
  ReadPostResponse,
  ReadStringResponse,
} from '@deepcrawl/types/routers/read/types';
import type { AppVariables } from '@/lib/context';
import type { RequestsOptions } from '@/services/analytics/activity-logger.service';
import { sha256Hash, stableStringify } from '@/utils/hash/hash-tools';
import {
  calculateResponseSize,
  generateResponseHash,
} from '@/utils/hash/response-hash';
import { logDebug, logError } from '@/utils/loggers';
import { targetUrlHelper } from '@/utils/url/target-url-helper';

export type ResponseTypes =
  | ReadStringResponse
  | ReadPostResponse
  | LinksResponse;

interface CreateRequestOptionsHashParams {
  requestOptions: RequestsOptions;
}

interface CreateStableResponseHashParams {
  path: string;
  requestUrl: string;
  optionsHash: string;
  response: ResponseTypes;
  linksRootKey?: string;
}

interface StoreResponseRecordParams {
  path: string;
  requestUrl: string;
  responseContent: ResponseTypes;
  optionsHash: string;
  responseHash: string;
}

/**
 * Response Record Service
 * Handles deduplication and storage of response record for both read and links endpoints
 */
export class ResponseRecordService {
  constructor(private db: AppVariables['dbd1']) {}

  async createRequestOptionsHash({
    requestOptions,
  }: CreateRequestOptionsHashParams): Promise<string> {
    return await sha256Hash(stableStringify(requestOptions));
  }

  /**
   * Stable response hash policy selector across endpoints.
   * - read-getMarkdown: hash(targetUrl + optionsHash + markdown)
   * - read-readUrl: hash(targetUrl + optionsHash + responseWithoutMetrics)
   * - links-*: hash(linksRootKey + optionsHash + 'links-v1')
   */
  async createStableResponseHash(
    params: CreateStableResponseHashParams,
  ): Promise<string> {
    const { path, optionsHash, requestUrl, response, linksRootKey } = params;
    if (path.startsWith('links-') && linksRootKey) {
      // links without tree (isTree=false) → response already canonicalized upstream
      if (
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        (response as LinksSuccessResponse).success === true &&
        !(response as LinksSuccessResponse).tree
      ) {
        const canonical = JSON.stringify(response);
        return await sha256Hash(
          `${linksRootKey}|${optionsHash}|links-v1|no-tree|${canonical}`,
        );
      }
      // default links (tree present or non-success): stable key only
      return await sha256Hash(`${linksRootKey}|${optionsHash}|links-v1`);
    }
    const targetUrl =
      typeof response === 'object'
        ? response.targetUrl
        : targetUrlHelper(requestUrl, true);
    return await generateResponseHash(targetUrl, optionsHash, response);
  }

  /**
   * store response record with deduplication
   */
  async storeResponseRecord(params: StoreResponseRecordParams): Promise<void> {
    const { path, responseContent, requestUrl, optionsHash, responseHash } =
      params;

    try {
      // Check if response already exists
      const existing = await this.db
        .select()
        .from(responseRecord)
        .where(eq(responseRecord.responseHash, responseHash))
        .limit(1);

      const now = new Date().toISOString();
      const responseSize = calculateResponseSize(responseContent);

      if (existing.length > 0) {
        // Response exists - refresh stored content and updatedAt for links only; for reads, only bump timestamp
        const isLinks = path.startsWith('links-');
        await this.db
          .update(responseRecord)
          .set(
            isLinks
              ? { responseContent, responseSize, updatedAt: now }
              : { updatedAt: now },
          )
          .where(eq(responseRecord.responseHash, responseHash));

        logDebug('[ResponseRecordService] 💽 Existing response record found', {
          responseHash,
        });
      } else {
        // New response - insert with deduplication
        const newResponse: NewResponseRecord = {
          path,
          responseContent,
          responseHash,
          optionsHash,
          responseSize,
        };

        await this.db.insert(responseRecord).values(newResponse);

        logDebug(
          '[ResponseRecordService] ✅ Response record stored successfully',
          {
            responseHash,
            requestUrl,
            responseSize,
          },
        );
      }
    } catch (error) {
      logError('[ResponseRecordService] ❌ Response record storage failed', {
        responseHash,
        requestUrl,
        optionsHash,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}

/**
 * Factory function to create ResponseRecordService instance
 */
export function createResponseRecordService(
  db: AppVariables['dbd1'],
): ResponseRecordService {
  return new ResponseRecordService(db);
}
