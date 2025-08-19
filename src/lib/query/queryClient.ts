import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query client configuration with optimized defaults
 * for the Linke user portal application.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes before considering it stale
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Keep data in cache for 10 minutes after components unmount
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

      // Retry failed requests up to 3 times
      retry: 3,

      // Exponential backoff with max 30 second delay
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Don't refetch on window focus by default (can be overridden per query)
      refetchOnWindowFocus: false,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,

      // No retry delay for mutations (fail fast)
      retryDelay: 0,
    },
  },
});

export default queryClient;
