import type { auth } from '@deepcrawl/auth/lib/auth';

// Infer types from the server auth instance
export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;

// API Key type based on Better Auth schema
export type ApiKey = {
  /**
   * ID
   */
  id: string;
  /**
   * The name of the key
   */
  name: string | null;
  /**
   * Shows the first few characters of the API key, including the prefix.
   * This allows you to show those few characters in the UI to make it easier for users to identify the API key.
   */
  start: string | null;
  /**
   * The API Key prefix. Stored as plain text.
   */
  prefix: string | null;
  /**
   * The hashed API key value
   */
  key: string;
  /**
   * The owner of the user id
   */
  userId: string;
  /**
   * The interval in which the `remaining` count is refilled by day
   *
   * @example 1 // every day
   */
  refillInterval: number | null;
  /**
   * The amount to refill
   */
  refillAmount: number | null;
  /**
   * The last refill date
   */
  lastRefillAt: Date | null;
  /**
   * Sets if key is enabled or disabled
   *
   * @default true
   */
  enabled: boolean;
  /**
   * Whether the key has rate limiting enabled.
   */
  rateLimitEnabled: boolean;
  /**
   * The duration in milliseconds
   */
  rateLimitTimeWindow: number | null;
  /**
   * Maximum amount of requests allowed within a window
   */
  rateLimitMax: number | null;
  /**
   * The number of requests made within the rate limit time window
   */
  requestCount: number;
  /**
   * Remaining requests (every time API key is used this should updated and should be updated on refill as well)
   */
  remaining: number | null;
  /**
   * When last request occurred
   */
  lastRequest: Date | null;
  /**
   * Expiry date of a key
   */
  expiresAt: Date | null;
  /**
   * created at
   */
  createdAt: Date;
  /**
   * updated at
   */
  updatedAt: Date;
  /**
   * Extra metadata about the apiKey
   */

  // biome-ignore lint/suspicious/noExplicitAny: false positive
  metadata: Record<string, any> | null;
  /**
   * Permissions for the API key
   */
  permissions?: {
    [key: string]: string[];
  } | null;
};

// Type for API keys as returned by Better Auth (without the actual key value)
// The 'key' property is hashed and not returned in API responses for security
export type ApiKeyResponse = Omit<ApiKey, 'key'> & {
  key?: string; // Make key optional since it's not returned in responses
};
