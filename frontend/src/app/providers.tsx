import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { I18nextProvider } from 'react-i18next';
import { ApiError } from '@/shared/lib/api-client';
import i18n from '@/shared/lib/i18n';
import { startSyncLoop } from '@/shared/offline/sync-queue';

/** App-wide providers: TanStack Query (server state) + i18n (RTL Arabic). */
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (count, error) => {
              // Don't retry auth/client errors (4xx).
              if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                return false;
              }
              return count < 2;
            },
          },
        },
      }),
  );

  // Background offline sync: flush queued sales when connectivity returns.
  useEffect(() => startSyncLoop(), []);

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={client}>
        {children}
        {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </I18nextProvider>
  );
}
