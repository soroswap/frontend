import { NetworkDetails, SorobanReactProvider, WalletNetwork } from 'stellar-react';
import useMounted from 'hooks/useMounted';

export default function MySorobanReactProvider({
  children,
  ...rest
}: {
  children: React.ReactNode;
  [x: string]: any;
}) {


  const mounted = useMounted();

  if (!mounted) return null;

  const mainnetNetworkDetails: NetworkDetails = {
    network: WalletNetwork.PUBLIC,
    sorobanRpcUrl: 'https://winter-red-lake.stellar-mainnet.quiknode.pro/3f4a180b25d91ed7d9b135f02ada9f9da2ce5f7e',
    horizonRpcUrl: 'https://winter-red-lake.stellar-mainnet.quiknode.pro/3f4a180b25d91ed7d9b135f02ada9f9da2ce5f7e'
  }

  const testnetNetworkDetails: NetworkDetails = {
    network: WalletNetwork.TESTNET,
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org/',
    horizonRpcUrl: 'https://horizon-testnet.stellar.org'
  }
  // Read network from environment variable
  const isMainnet = process.env.NEXT_PUBLIC_DEFAULT_NETWORK === 'mainnet';
  const activeNetwork = isMainnet ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET;

  return (
    <SorobanReactProvider
      appName={'Soroswap'}
      allowedNetworkDetails={[mainnetNetworkDetails, testnetNetworkDetails]}
      activeNetwork={activeNetwork}
      {...rest}
    >
      {children}
    </SorobanReactProvider>
  );
}
