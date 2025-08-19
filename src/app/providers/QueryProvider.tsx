import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../../lib/query/queryClient';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * TanStack Query provider component that wraps the application with QueryClient context.
 * Includes React Query DevTools in development mode for debugging and inspection.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default QueryProvider;
