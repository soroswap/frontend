import { NetworkDetails, SorobanReactProvider, WalletNetwork } from 'stellar-react';
import { ChainMetadata, WalletChain } from '@soroban-react/types';
import { standalone, testnet, mainnet } from '@soroban-react/chains';
import useMounted from 'hooks/useMounted';

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