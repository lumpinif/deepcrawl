import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient,
} from '@tanstack/react-query';

export function makeQueryClient() {
  const client = new QueryClient({
    // queryCache: new QueryCache({
    //   onError: (error, query) => {
    //     console.error(`❌ Query Error: ${error.message}`, query);
    //     if (error.message) {
    //       toast.error(error.message, {
    //         action: {
    //           label: 'retry',
    //           onClick: () => {
    //             const queryKey = query.queryKey as QueryKey;
    //             if (queryKey) {
    //               client.invalidateQueries({ queryKey });
    //             } else {
    //               client.invalidateQueries();
    //             }
    //           },
    //         },
    //       });
    //     }
    //   },
    // }),
    defaultOptions: {
      queries: {
        // Optimized stale time for better performance with cookie caching
        staleTime: 10 * 60 * 1000, // 10 minutes (matches Better Auth cookie cache)
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
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
        shouldRedactErrors: () => {
          // We should not catch Next.js server errors
          // as that's how Next.js detects dynamic pages
          // so we cannot redact them.
          // Next.js also automatically redacts errors for us
          // with better digests.
          return false;
        },
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

let browserQueryClient: QueryClient | undefined;

// Singleton pattern for browser query client to avoid re-creating on React suspends
export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
