import { authClient } from '@/lib/auth.client';
import { useQuery } from '@tanstack/react-query';

// Query keys for consistency with your layout prefetching
export const userQueryKeys = {
  session: ['user', 'session'] as const,
  listSessions: ['user', 'list-sessions'] as const,
  deviceSessions: ['user', 'device-sessions'] as const,
} as const;

export const useUserSession = () => {
  return useQuery({
    queryKey: ['user', 'session'],
    queryFn: async () => {
      const result = await authClient.getSession();
      return JSON.parse(JSON.stringify(result)); // Match server serialization
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Data will be immediately available from prefetch
  });
};

/**
 * Returns just the user object
 */
export const useUser = () => {
  const { data: session, ...rest } = useUserSession();
  return {
    user: session?.user ?? null,
    ...rest,
  };
};
