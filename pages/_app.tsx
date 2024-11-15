import type { AppProps } from 'next/app';
import '../styles/globals.css';

import Providers from 'components/Providers/Providers';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: Infinity,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
    <Providers>
      <Component {...pageProps} />
    </Providers>
    </QueryClientProvider>
  );
}
