/**
 * Configuration validation utilities for DeepCrawl Auth
 * Ensures consistency between auth worker settings and URLs
 */

interface ValidationConfig {
  useAuthWorker: boolean;
  betterAuthUrl: string;
  isDevelopment: boolean;
  context?: string; // 'client' | 'server' for better error messages
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

/**
 * Expected URL patterns for different modes and environments
 * UPDATE THIS TO MATCH .ENV
 */
const URL_PATTERNS = {
  authWorker: {
    production: ['https://auth.deepcrawl.dev'],
    development: ['http://localhost:8787', 'http://127.0.0.1:8787'],
  },
  nextjs: {
    production: [
      'https://app.deepcrawl.dev',
      'https://app.deepcrawl.dev/api/auth',
    ],
    development: [
      'http://localhost:3000',
      'http://localhost:3000/api/auth',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3000/api/auth',
    ],
  },
} as const;

/**
 * Validates consistency between NEXT_PUBLIC_USE_AUTH_WORKER and BETTER_AUTH_URL
 */
export function validateAuthConfiguration(
  config: ValidationConfig,
): ValidationResult {
  const {
    useAuthWorker,
    betterAuthUrl,
    isDevelopment,
    context = 'unknown',
  } = config;

  if (!betterAuthUrl) {
    return {
      isValid: false,
      error: `[${context}] BETTER_AUTH_URL is required but not provided`,
    };
  }

  const environment = isDevelopment ? 'development' : 'production';
  const mode = useAuthWorker ? 'authWorker' : 'nextjs';
  const expectedPatterns = URL_PATTERNS[mode][environment];

  // Normalize URL for comparison (remove trailing slashes, /api/auth suffix)
  const normalizedUrl = betterAuthUrl
    .replace(/\/api\/auth\/?$/, '')
    .replace(/\/$/, '');

  // Check if the URL matches expected patterns for the chosen mode
  const isValidUrl = expectedPatterns.some((pattern) => {
    const normalizedPattern = pattern
      .replace(/\/api\/auth\/?$/, '')
      .replace(/\/$/, '');
    return normalizedUrl === normalizedPattern;
  });

  if (!isValidUrl) {
    const modeDescription = useAuthWorker
      ? 'external auth worker'
      : 'Next.js API routes';
    const expectedUrls = expectedPatterns.join(' or ');

    return {
      isValid: false,
      error: `[${context}] Configuration mismatch: NEXT_PUBLIC_USE_AUTH_WORKER is set to ${useAuthWorker ? 'true (default)' : 'false'} (${modeDescription}), but BETTER_AUTH_URL="${betterAuthUrl}" doesn't match expected pattern for ${environment}. Expected: ${expectedUrls}`,
    };
  }

  // Additional warnings for common misconfigurations
  let warning: string | undefined;

  if (useAuthWorker && betterAuthUrl.includes('/api/auth')) {
    warning = `[${context}] Warning: BETTER_AUTH_URL includes '/api/auth' path but auth worker mode is enabled. The auth worker handles routing internally.`;
  }

  if (
    !useAuthWorker &&
    !betterAuthUrl.includes('/api/auth') &&
    !isDevelopment
  ) {
    warning = `[${context}] Warning: BETTER_AUTH_URL for Next.js mode should typically include '/api/auth' path in production.`;
  }

  return {
    isValid: true,
    warning,
  };
}

/**
 * Throws an error if auth configuration is invalid
 * Use this for critical validation that should stop execution
 */
export function assertValidAuthConfiguration(config: ValidationConfig): void {
  const result = validateAuthConfiguration(config);

  if (!result.isValid) {
    throw new Error(`Auth Configuration Error: ${result.error}`);
  }

  if (result.warning && config.isDevelopment) {
    console.warn(`Auth Configuration Warning: ${result.warning}`);
  }
}
