import { mintHs256Jwt } from '../lib/jwt-token.js';
import type { AuthMode } from '../ui/prompt-answers.js';

export type QuickTestKind = 'read' | 'links';

export type QuickTestResult = {
  ok: boolean;
  requestPath: string;
  authLabel: string;
  statusCode: number;
  statusText: string;
  preview: string;
  curlCommand: string;
};

type FetchLike = typeof fetch;

function truncatePreview(value: string, maxLength = 1200): string {
  const normalized = value.replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return '(empty response)';
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength)}...`;
}

function buildCurlCommand(url: string, token?: string): string {
  if (!token) {
    return `curl "${url}"`;
  }

  return `curl -H "Authorization: Bearer ${token}" "${url}"`;
}

function buildRequestPath(kind: QuickTestKind, targetUrl: string): string {
  return kind === 'read'
    ? `/read?url=${encodeURIComponent(targetUrl)}`
    : `/links?url=${encodeURIComponent(targetUrl)}`;
}

function buildAuthDetails(input: {
  authMode: AuthMode;
  jwtSecret?: string;
  jwtIssuer?: string;
  jwtAudience?: string;
}): {
  token?: string;
  authLabel: string;
} {
  if (input.authMode !== 'jwt') {
    return {
      authLabel: 'No auth required',
    };
  }

  if (!input.jwtSecret) {
    throw new Error('JWT secret is required to run a JWT quick test.');
  }

  return {
    token: mintHs256Jwt({
      secret: input.jwtSecret,
      subject: 'deepcrawl-cli-test',
      expiresInMinutes: 15,
      issuer: input.jwtIssuer?.trim() || undefined,
      audience: input.jwtAudience?.trim() || undefined,
    }),
    authLabel: 'Temporary JWT signed from your saved settings',
  };
}

async function buildResponsePreview(response: Response): Promise<string> {
  const body = await response.text();
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      return truncatePreview(JSON.stringify(JSON.parse(body), null, 2));
    } catch {
      return truncatePreview(body);
    }
  }

  if (body.trim().startsWith('{') || body.trim().startsWith('[')) {
    try {
      return truncatePreview(JSON.stringify(JSON.parse(body), null, 2));
    } catch {
      return truncatePreview(body);
    }
  }

  return truncatePreview(body);
}

export function buildQuickTestPreviewResult({
  workerUrl,
  kind,
  targetUrl,
  authMode,
  jwtSecret,
  jwtIssuer,
  jwtAudience,
}: {
  workerUrl: string;
  kind: QuickTestKind;
  targetUrl: string;
  authMode: AuthMode;
  jwtSecret?: string;
  jwtIssuer?: string;
  jwtAudience?: string;
}): QuickTestResult {
  const requestPath = buildRequestPath(kind, targetUrl);
  const requestUrl = new URL(requestPath, workerUrl).toString();
  const { token, authLabel } = buildAuthDetails({
    authMode,
    jwtSecret,
    jwtIssuer,
    jwtAudience,
  });
  const preview =
    kind === 'read'
      ? 'This domain is for use in documentation examples without needing permission.\n[Learn more](https://iana.org/domains/example)'
      : JSON.stringify(
          {
            links: ['https://www.iana.org/domains/example'],
          },
          null,
          2,
        );

  return {
    ok: true,
    requestPath,
    authLabel,
    statusCode: 200,
    statusText: 'Preview only',
    preview,
    curlCommand: buildCurlCommand(requestUrl, token),
  };
}

export async function runQuickTestV0Worker({
  workerUrl,
  kind,
  targetUrl,
  authMode,
  jwtSecret,
  jwtIssuer,
  jwtAudience,
  fetcher = fetch,
}: {
  workerUrl: string;
  kind: QuickTestKind;
  targetUrl: string;
  authMode: AuthMode;
  jwtSecret?: string;
  jwtIssuer?: string;
  jwtAudience?: string;
  fetcher?: FetchLike;
}): Promise<QuickTestResult> {
  const endpointPath = buildRequestPath(kind, targetUrl);
  const requestUrl = new URL(endpointPath, workerUrl).toString();
  const { token, authLabel } = buildAuthDetails({
    authMode,
    jwtSecret,
    jwtIssuer,
    jwtAudience,
  });

  try {
    const response = await fetcher(requestUrl, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });

    return {
      ok: response.ok,
      requestPath: endpointPath,
      authLabel,
      statusCode: response.status,
      statusText: response.statusText,
      preview: await buildResponsePreview(response),
      curlCommand: buildCurlCommand(requestUrl, token),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown quick test error.';

    return {
      ok: false,
      requestPath: endpointPath,
      authLabel,
      statusCode: 0,
      statusText: 'Request failed',
      preview: truncatePreview(message),
      curlCommand: buildCurlCommand(requestUrl, token),
    };
  }
}
