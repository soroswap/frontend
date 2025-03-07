import {
  SorobanReactProvider, 
  NetworkDetails, 
  WalletNetwork
} from 'soroban-react-stellar-wallets-kit';

import useMounted from 'hooks/useMounted';

const mainnetNetworkDetails : NetworkDetails = {
  network: WalletNetwork.PUBLIC,
  sorobanRpcUrl: 'https://soroban-rpc.creit.tech/',
  horizonRpcUrl: 'https://horizon.stellar.org'
}

const testnetNetworkDetails : NetworkDetails = {
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
        appName={"Example Stellar App"}
        allowedNetworkDetails={[mainnetNetworkDetails, testnetNetworkDetails]}
        activeNetwork={process.env.NEXT_PUBLIC_DEFAULT_NETWORK || WalletNetwork.TESTNET}
      >
      {children}
    </SorobanReactProvider>
  );
}
