'use client';
import { makeQueryClient } from '@/lib/query.client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

export function QueryProviders({ children }: { children: ReactNode }) {
  const queryClient = makeQueryClient();
  const router = useRouter();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        offset={{ top: -7 }}
        position="top-center"
        className="flex items-center justify-center"
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
