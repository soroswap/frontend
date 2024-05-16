import type { AppProps } from 'next/app';

import Providers from 'components/Providers';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
