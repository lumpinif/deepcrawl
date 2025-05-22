import { z } from 'zod';

const MAX_URL_LENGTH = 2048;
const UNSAFE_PATTERNS = [
  /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])/,
  /^192\.168\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^169\.254\./,
  /^fc00:/,
  /^fe80:/,
  /\.(local|internal|localhost)$/,
  /^https?:\/\/(.*\.)?docker/,
];

const BLOCKED_PROTOCOLS = new Set([
  'data:',
  'javascript:',
  'file:',
  'ftp:',
  'ws:',
  'wss:',
  'about:',
  'vbscript:',
]);

const BLOCKED_EXTENSIONS = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.zip',
  '.rar',
  '.exe',
  '.dmg',
  '.pkg',
  '.iso',
  '.tar',
  '.gz',
  '.7z',
  '.mp3',
  '.mp4',
  '.avi',
  '.mov',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.svg',
  '.webp',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.html',
  '.htm',
  '.php',
  '.asp',
  '.aspx',
  '.jsp',
  '.cfm',
  '.txt',
  '', // empty extension for root paths
]);

interface ValidationResult {
  isValid: boolean;
  normalizedURL?: string;
  error?: string;
  unsafe: boolean;
}

// Zod schema for URLs with protocol
const urlWithProtocolSchema = z
  .string()
  .min(1)
  .max(MAX_URL_LENGTH)
  .refine(
    (url) => {
      try {
        const urlObj = new URL(url);
        // Validate TLD - must be at least 2 characters and contain only letters
        const tld = urlObj.hostname.split('.').pop() || '';
        if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Must be a valid URL' },
  );

function extractActualUrl(inputUrl: string): string {
  // If it's already a valid URL with protocol, return it
  if (inputUrl.match(/^https?:\/\/[^\/]+\.[^\/]+/i)) {
    return inputUrl;
  }

  // Split on forward slashes and find the first part that looks like a valid domain
  const parts = inputUrl.split(/\/+/);
  let actualUrl = '';

  for (let i = 0; i < parts.length; i++) {
    // Look for parts that contain a dot and match domain pattern
    if (
      parts[i].includes('.') &&
      /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(parts[i]) && // Valid domain pattern
      !/^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(parts[i]) && // Skip IP addresses
      !/^localhost(:\d+)?$/.test(parts[i]) // Skip localhost
    ) {
      actualUrl = parts.slice(i).join('/');
      break;
    }
  }

  // If no valid domain was found, use the original input
  // This will likely fail validation later, which is what we want
  if (!actualUrl) {
    actualUrl = inputUrl;
  }

  // Add protocol if missing
  if (!actualUrl.match(/^https?:\/\//i)) {
    actualUrl = `https://${actualUrl}`;
  }

  return actualUrl;
}

export function validateURL(url: string): ValidationResult {
  if (!url || url.length > MAX_URL_LENGTH) {
    return {
      isValid: false,
      error: 'URL is empty or exceeds maximum length',
      unsafe: false,
    };
  }

  try {
    // Extract the actual URL from the input
    const actualUrl = extractActualUrl(url);

    // Early validation for obviously invalid formats
    if (!/^https?:\/\/[^\/]+\.[^\/]+/i.test(actualUrl)) {
      return {
        isValid: false,
        error:
          'Invalid URL format. URL must either start with http:// or https:// or contain a valid domain',
        unsafe: false,
      };
    }

    // Check for blocked protocols
    const lowerUrl = actualUrl.toLowerCase();
    if (
      Array.from(BLOCKED_PROTOCOLS).some((protocol) =>
        lowerUrl.startsWith(protocol),
      )
    ) {
      return {
        isValid: false,
        error: 'Protocol not allowed',
        unsafe: true,
      };
    }

    // Parse the URL
    const urlObj = new URL(actualUrl);

    // Check for unsafe patterns
    const hostname = urlObj.hostname.toLowerCase();
    for (const pattern of UNSAFE_PATTERNS) {
      if (pattern.test(hostname) || pattern.test(url.toLowerCase())) {
        return {
          isValid: false,
          error: 'URL is not allowed for security reasons',
          unsafe: true,
        };
      }
    }

    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
      const tld = hostname.split('.').pop() || '';
      if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
        return {
          isValid: false,
          error: 'Invalid domain TLD',
          unsafe: false,
        };
      }
    }

    return {
      isValid: true,
      normalizedURL: normalizeURL(urlObj),
      unsafe: false,
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format',
      unsafe: false,
    };
  }
}

function normalizeURL(urlObj: URL): string {
  // Remove default ports
  if (
    (urlObj.protocol === 'http:' && urlObj.port === '80') ||
    (urlObj.protocol === 'https:' && urlObj.port === '443')
  ) {
    urlObj.port = '';
  }

  // Clean hostname
  let hostname = urlObj.hostname.toLowerCase();

  // Prefer non-www version unless specifically needed
  if (hostname.startsWith('www.') && hostname.split('.').length > 2) {
    hostname = hostname.slice(4);
  }

  // Remove trailing slash from pathname if it's just "/"
  const pathname = urlObj.pathname === '/' ? '' : urlObj.pathname;

  // Reconstruct URL without trailing slash
  return `${urlObj.protocol}//${hostname}${
    urlObj.port ? `:${urlObj.port}` : ''
  }${pathname}${urlObj.search}${urlObj.hash}`;
}

/**
 * TODO: Disable file type filtering after we have support for file type parsing and scraping.
 *
 * Enable file type filtering. When enabled, only URLs with allowed file extensions
 * will be scraped.
 * @default true
 */
export const ENABLE_FILE_TYPE_FILTERING = true;

export interface ScrapeAllowedResult {
  allowed: boolean;
  reason?: string;
}

export function isScrapeAllowed(url: string): ScrapeAllowedResult {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();

    if (ENABLE_FILE_TYPE_FILTERING) {
      // Check file extensions
      const extension = pathname.match(/\.[^/.]+$/)?.[0] || '';
      if (BLOCKED_EXTENSIONS.has(extension)) {
        return {
          allowed: false,
          reason: `URL has blocked extension: ${extension}`,
        };
      }

      // If there's an extension and it's not in allowed list, block it
      if (extension && !ALLOWED_EXTENSIONS.has(extension)) {
        return {
          allowed: false,
          reason: `URL extension not in allowed list: ${extension}`,
        };
      }
    }

    // Check for file download indicators in query params
    if (
      urlObj.searchParams.has('file') ||
      urlObj.searchParams.has('download') ||
      urlObj.searchParams.has('attachment')
    ) {
      return {
        allowed: false,
        reason: 'URL contains download indicators in query parameters',
      };
    }

    // Check for common non-scrapeable paths
    const blockedPaths = [
      '/login',
      '/signin',
      '/signup',
      '/register',
      '/auth',
      '/account',
      '/cart',
      '/checkout',
      '/payment',
    ];

    if (
      blockedPaths.some((path) => urlObj.pathname.toLowerCase().includes(path))
    ) {
      return {
        allowed: false,
        reason: 'URL contains blocked path segment',
      };
    }

    // Check for authentication tokens in URL
    if (
      urlObj.searchParams.has('token') ||
      urlObj.searchParams.has('auth') ||
      urlObj.searchParams.has('key')
    ) {
      return {
        allowed: false,
        reason: 'URL contains authentication parameters',
      };
    }

    return { allowed: true };
  } catch {
    return {
      allowed: false,
      reason: 'Invalid URL format',
    };
  }
}
