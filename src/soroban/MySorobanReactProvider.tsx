import { futurenet, sandbox, standalone, testnet } from '@soroban-react/chains';
import { SorobanReactProvider } from '@soroban-react/core';
import { freighter } from '@soroban-react/freighter';
import { ChainMetadata, Connector } from '@soroban-react/types';
import useMounted from 'hooks/useMounted';
import React from 'react';

const chains: ChainMetadata[] = [testnet, sandbox, standalone, futurenet];
const connectors: Connector[] = [freighter()];

export default function MySorobanReactProvider({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();

  if (!mounted) return null;
  return (
    <SorobanReactProvider
      chains={chains}
      appName={'Soroswap'}
      connectors={connectors}
      activeChain={testnet}
    >
      {children}
    </SorobanReactProvider>
  );
}
