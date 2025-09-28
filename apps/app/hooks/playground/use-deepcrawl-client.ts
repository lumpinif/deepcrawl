import { DeepcrawlApp } from 'deepcrawl';
import { useCallback, useEffect, useMemo, useRef } from 'react';

interface UseDeepcrawlClientOptions {
  apiKey: string;
  baseUrl?: string;
}

/**
 * Custom hook for managing DeepcrawlApp SDK client
 * Provides memoized client instance with proper initialization
 */
export function useDeepcrawlClient({
  apiKey,
  baseUrl,
}: UseDeepcrawlClientOptions) {
  const clientRef = useRef<DeepcrawlApp | null>(null);

  // Track config to detect changes that require reinitialization
  const clientConfig = useMemo(
    () => ({
      apiKey,
      baseUrl: baseUrl || 'https://api.deepcrawl.dev',
    }),
    [apiKey, baseUrl],
  );

  const configRef = useRef(clientConfig);

  const ensureClient = useCallback(() => {
    const configChanged = configRef.current !== clientConfig;

    if (!apiKey) {
      clientRef.current = null;
      configRef.current = clientConfig;
      return null;
    }

    if (configChanged) {
      clientRef.current = null;
    }

    if (!clientRef.current) {
      try {
        clientRef.current = new DeepcrawlApp(clientConfig);
      } catch (error) {
        console.error('Failed to initialize DeepcrawlApp:', error);
        clientRef.current = null;
      }
    }

    configRef.current = clientConfig;

    return clientRef.current;
  }, [apiKey, clientConfig]);

  useEffect(() => {
    ensureClient();
  }, [ensureClient]);

  return {
    client: clientRef.current,
    ensureClient,
    isReady: clientRef.current !== null,
  };
}
