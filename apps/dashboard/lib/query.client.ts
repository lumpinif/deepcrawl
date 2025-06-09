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
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });

  return client;
}
