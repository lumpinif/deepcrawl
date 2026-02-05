import { WorkerEntrypoint } from 'cloudflare:workers';
import type { Session } from '@deepcrawl/auth/types';

/**
 * Type-only RPC surface for the auth worker service binding.
 * Keep this file free of runtime code or worker env dependencies.
 */
export default class AuthWorkerRpc extends WorkerEntrypoint {
  getSessionWithAPIKey(apiKey: string): Promise<Session | undefined>;
  clearApiKeyCache(apiKey: string): Promise<void>;
}
