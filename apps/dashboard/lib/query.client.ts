import { QueryCache, QueryClient, type QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';

export function makeQueryClient() {
  const client = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        console.error(`❌ Query Error: ${error.message}`, query);
        if (error.message) {
          toast.error(error.message, {
            action: {
              label: 'retry',
              onClick: () => {
                const queryKey = query.queryKey as QueryKey;
                if (queryKey) {
                  client.invalidateQueries({ queryKey });
                } else {
                  client.invalidateQueries();
                }
              },
            },
          });
        }
      },
    }),
    defaultOptions: {
      queries: {
        // Optimized stale time for better performance with cookie caching
        staleTime: 5 * 60 * 1000, // 5 minutes (matches Better Auth cookie cache)
        // Enable stale-while-revalidate pattern
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: 'always',
        // Reduce aggressive retries on the server
        retry: (failureCount, error) => {
          // Don't retry on 404s
          if (error?.message?.includes('404')) return false;
          // Don't retry more than 3 times
          return failureCount < 3;
        },
        // Cache data longer on success
        gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      },
      mutations: {
        // Global mutation error handling
        onError: (error) => {
          console.error('❌ Mutation Error:', error);
        },
      },
    },
  });

  return client;
}
