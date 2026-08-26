'use client';

import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { ApiError } from '@/lib/api';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000, // 30 seconds
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
        mutationCache: new MutationCache({
          onError: (error) => {
            // Global fallback for mutations that don't handle their own errors
            if (error instanceof ApiError) {
              // Only show toast if it's a network/server error (not validation)
              if (error.statusCode >= 500) {
                toast.error('Server error. Please try again later.');
              }
            } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
              toast.error('Network error. Please check your connection.');
            }
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors closeButton duration={4000} />
    </QueryClientProvider>
  );
}
