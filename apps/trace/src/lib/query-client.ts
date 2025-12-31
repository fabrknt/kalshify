import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client configuration
 * Configured for optimal caching and performance
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,        // Data is fresh for 30 seconds
      gcTime: 5 * 60 * 1000,       // Cache for 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1,                    // Retry failed requests once
      refetchOnMount: true,        // Refetch on component mount if stale
    },
    mutations: {
      retry: 0,                    // Don't retry mutations
    },
  },
});
