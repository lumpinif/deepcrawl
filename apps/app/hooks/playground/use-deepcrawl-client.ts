import { DeepcrawlApp } from 'deepcrawl';
import { useEffect, useMemo, useRef } from 'react';

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

  // Memoize client configuration to prevent unnecessary re-initialization
  const clientConfig = useMemo(
    () => ({
      apiKey,
      baseUrl: baseUrl || 'https://api.deepcrawl.dev',
    }),
    [apiKey, baseUrl],
  );

  // Initialize client when config changes
  useEffect(() => {
    if (!apiKey) {
      clientRef.current = null;
      return;
    }

    try {
      clientRef.current = new DeepcrawlApp(clientConfig);
    } catch (error) {
      console.error('Failed to initialize DeepcrawlApp:', error);
      clientRef.current = null;
    }
  }, [clientConfig, apiKey]);

  return {
    client: clientRef.current,
    isReady: clientRef.current !== null,
  };
}
