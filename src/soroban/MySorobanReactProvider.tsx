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
    sorobanRpcUrl: 'https://soroban-rpc.creit.tech/',
    horizonRpcUrl: 'https://horizon.stellar.org'
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
