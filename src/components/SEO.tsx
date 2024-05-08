import React from 'react';
import Head from 'next/head';

interface SEOProps {
  title: string;
  description?: string;
}

export default function SEO({ title, description }: SEOProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description ?? 'The first DEX of the Soroban Blockchain'} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />

      <meta property="og:title" content="Soroswap" />
      <meta property="og:description" content="The first DEX of the Soroban Blockchain" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://soroswap.finance/images/logo-light.svg" />
      <meta property="og:url" content="https://app.soroswap.finance" />

      <meta name="twitter:image" content="https://soroswap.finance/images/logo-light.svg" />
    </Head>
  );
}
