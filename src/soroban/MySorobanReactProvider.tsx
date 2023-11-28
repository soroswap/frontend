import React from 'react';
import { futurenet, sandbox, standalone, testnet } from '@soroban-react/chains';
import { SorobanReactProvider } from '@soroban-react/core';
import { freighter } from '@soroban-react/freighter';
import { ChainMetadata, Connector, WalletChain } from '@soroban-react/types';
import useMounted from 'hooks/useMounted';

const chains: ChainMetadata[] =
  process.env.NODE_ENV === 'production' ? [testnet] : [sandbox, standalone, futurenet, testnet];
// const activeChain: WalletChain = process.env.NODE_ENV === 'production' ? testnet : standalone;
const activeChain: WalletChain = testnet;

const connectors: Connector[] = [freighter()];

export default function MySorobanReactProvider({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <SorobanReactProvider
      chains={chains}
      appName={'Soroswap'}
      connectors={connectors}
      activeChain={activeChain}
    >
      {children}
    </SorobanReactProvider>
  );
}
