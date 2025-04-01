import { NetworkDetails, SorobanReactProvider, WalletNetwork } from 'stellar-react';
import useMounted from 'hooks/useMounted';

const WalletNetworks = [
  "Public Global Stellar Network ; September 2015",
  "Test SDF Network ; September 2015",
  "Test SDF Future Network ; October 2022",
  "Local Sandbox Stellar Network ; September 2022",
  "Standalone Network ; February 2017"
]
const mainnetNetworkDetails: NetworkDetails = {
  network: WalletNetworks[0] as WalletNetwork,
  sorobanRpcUrl: 'https://soroban-rpc.creit.tech/',
  horizonRpcUrl: 'https://horizon.stellar.org'
}

const testnetNetworkDetails: NetworkDetails = {
  network: WalletNetworks[1] as WalletNetwork,
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