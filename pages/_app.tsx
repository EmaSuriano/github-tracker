import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import './styles.css';

import type { Session } from 'next-auth';
import type { AppProps } from 'next/app';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session; dehydratedState: unknown }>) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <div className="container mx-auto">
          <Component {...pageProps} />
        </div>
      </SessionProvider>
    </QueryClientProvider>
  );
}
