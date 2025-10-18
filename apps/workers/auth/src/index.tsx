import { WorkerEntrypoint } from 'cloudflare:workers';
import type { AppContext, Auth } from '@auth/lib/context';
import createHonoApp from '@auth/lib/hono/create-hono-app';
import { logDebug } from '@auth/utils/loggers';
import { API_KEY_CACHE_CONFIG } from '@deepcrawl/auth/configs/constants';
import { createAuth } from './lib/better-auth';
import { kvPutWithRetry } from './utils/kv';

const app = createHonoApp();

app.get('/', (c) => {
  return c.text('Welcome to Deepcrawl Auth Worker');
});

/* test route */
// app.route('/', validateAPIKeyRouter);

export default class extends WorkerEntrypoint<AppContext['Bindings']> {
  // Cache the auth instance to avoid recreating it on every RPC call
  private _authInstance: Auth | null = null;

  private getAuthInstance() {
    if (!this._authInstance) {
      this._authInstance = createAuth(this.env);
    }
    return this._authInstance;
  }

  async fetch(request: Request) {
    return app.fetch(request, this.env, this.ctx);
  }

  // cf services binding rpc call (no correct types generated in the consumer worker for now)
  async getSessionWithAPIKey(apiKey: string) {
    const startTime = performance.now();
    const cacheKey = `${API_KEY_CACHE_CONFIG.KEY_PREFIX}${apiKey}`;
    const cacheTTL = API_KEY_CACHE_CONFIG.TTL_SECONDS;

    try {
      // Try to get cached session first
      const cachedSession = await this.env.DEEPCRAWL_AUTH_KV.get(cacheKey);
      if (cachedSession) {
        const parsedSession = JSON.parse(cachedSession);

        // Validate that cached session is still valid (not expired)
        if (parsedSession?.session?.expiresAt) {
          const expiresAt = new Date(parsedSession.session.expiresAt);
          if (expiresAt > new Date()) {
            const endTime = performance.now();
            logDebug(
              `🎯 API key auth CACHE HIT - took: ${((endTime - startTime) / 1000).toFixed(3)}s`,
            );
            return parsedSession;
          }
          // If expired, remove from cache and continue to fresh lookup
          await this.env.DEEPCRAWL_AUTH_KV.delete(cacheKey);
          logDebug('🗑️ Removed expired session from cache');
        } else if (parsedSession?.session) {
          const endTime = performance.now();
          logDebug(
            `🎯 API key auth CACHE HIT (no expiry) - took: ${((endTime - startTime) / 1000).toFixed(3)}s`,
          );
          return parsedSession;
        }
      }
    } catch (cacheError) {
      // Log cache error but continue with fresh lookup
      logDebug('❌ Cache lookup failed:', cacheError);
    }

    // Cache miss - get fresh session from database
    logDebug('📀 API key auth CACHE MISS - querying database');
    const dbStartTime = performance.now();

    // Use the auth instance for database validation
    const auth = this.getAuthInstance();
    const sessionData = await auth.api.getSession({
      headers: new Headers({
        'x-api-key': apiKey,
      }),
    });

    logDebug(
      `🧑 User session data found: ${Boolean(sessionData?.session && sessionData?.user)}`,
    );

    const dbEndTime = performance.now();
    logDebug(
      `💾 Database query took: ${((dbEndTime - dbStartTime) / 1000).toFixed(3)}s`,
    );

    // Cache successful validations
    if (sessionData?.session && sessionData?.user) {
      try {
        // kvPutWithRetry() will continue running, even after this method returns a sessionData to the caller
        this.ctx.waitUntil(
          kvPutWithRetry(
            this.env.DEEPCRAWL_AUTH_KV,
            cacheKey,
            JSON.stringify(sessionData),
            { expirationTtl: cacheTTL },
          ),
        );
        logDebug('💾 Cached session for', cacheTTL, 'seconds');
      } catch (cacheError) {
        // Log cache write error but don't fail the request
        logDebug('❌ Cache write failed:', cacheError);
      }
    } else {
      logDebug('⚠️ Not caching invalid session');
    }

    const endTime = performance.now();
    logDebug(
      `🔍 Total API key auth took: ${((endTime - startTime) / 1000).toFixed(3)}s`,
    );
    return sessionData;
  }

  // Utility method to clear specific API key cache for security/maintenance
  // Useful when an API key is compromised or disabled and needs immediate invalidation
  async clearApiKeyCache(apiKey: string) {
    const cacheKey = `${API_KEY_CACHE_CONFIG.KEY_PREFIX}${apiKey}`;
    await this.env.DEEPCRAWL_AUTH_KV.delete(cacheKey);
    logDebug(`🗑️ Cleared cache for API key: ${apiKey.slice(0, 10)}...`);
  }
}
