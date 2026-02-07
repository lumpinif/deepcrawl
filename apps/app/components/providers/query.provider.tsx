'use client';

import { Toaster } from '@deepcrawl/ui/components/ui/sonner';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';
import { PlaygroundApiKeyBootstrap } from '@/components/api-keys/playground-api-key-bootstrap';
import { getQueryClient } from '@/query/query.client';

export function QueryProviders({ children }: { children: ReactNode }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <PlaygroundApiKeyBootstrap />
      <Toaster
        className="custom-toaster flex items-center justify-center"
        offset={{ top: 0 }}
        position="top-center"
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
