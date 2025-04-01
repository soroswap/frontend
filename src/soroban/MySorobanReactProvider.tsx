import { standalone, testnet, mainnet } from 'stellar-react';
import { SorobanReactProvider } from 'stellar-react';
import { freighter } from '@soroban-react/freighter';
import { lobstr } from '@soroban-react/lobstr';
import { xbull } from '@soroban-react/xbull';
import { hana } from '@soroban-react/hana';
import { ChainMetadata, Connector, WalletChain } from 'stellar-react';
import useMounted from 'hooks/useMounted';

// Set allowed chains:
const chains: ChainMetadata[] =
  process.env.NODE_ENV === 'production' ? [testnet, mainnet] : [standalone, testnet, mainnet];

// Set chain by default:
// Helper function
const findWalletChainByName = (name: string): WalletChain | undefined => {
  return chains.find((chain) => chain.id === name);
};

// Get the active chain based on the environment variable or default to testnet
const activeChainName = process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'testnet';
const activeChain: WalletChain = findWalletChainByName(activeChainName) || testnet;

// Set allowed connectors
export const walletConnectors: Connector[] = [freighter(), xbull(), lobstr(), hana()];

export default function MySorobanReactProvider({
  children,
  ...rest
}: {
  children: React.ReactNode;
  [x: string]: any;
}) {
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <SorobanReactProvider
      chains={chains}
      appName={'Soroswap'}
      connectors={walletConnectors}
      activeChain={activeChain}
      {...rest}
    >
      {children}
    </SorobanReactProvider>
  );
}