import { NetworkDetails, SorobanReactProvider, WalletNetwork } from 'stellar-react';
import { ChainMetadata, WalletChain } from '@soroban-react/types';
import { standalone, testnet, mainnet } from '@soroban-react/chains';
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

const mainnetNetworkDetails: NetworkDetails = {
  network: WalletNetwork.PUBLIC,
  sorobanRpcUrl: 'https://soroban-rpc.creit.tech/',
  horizonRpcUrl: 'https://horizon.stellar.org'
}

const testnetNetworkDetails: NetworkDetails = {
  network: WalletNetwork.TESTNET,
  sorobanRpcUrl: 'https://soroban-testnet.stellar.org/',
  horizonRpcUrl: 'https://horizon-testnet.stellar.org'
}
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
      appName={'Soroswap'}
      allowedNetworkDetails={[mainnetNetworkDetails, testnetNetworkDetails]}
      activeNetwork={WalletNetwork.TESTNET}
      {...rest}
    >
      {children}
    </SorobanReactProvider>
  );
}