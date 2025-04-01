import { NetworkDetails, SorobanReactProvider } from 'stellar-react';
import useMounted from 'hooks/useMounted';


enum WalletNetwork {
  PUBLIC = "Public Global Stellar Network ; September 2015",
  TESTNET = "Test SDF Network ; September 2015",
  FUTURENET = "Test SDF Future Network ; October 2022",
  SANDBOX = "Local Sandbox Stellar Network ; September 2022",
  STANDALONE = "Standalone Network ; February 2017"
}
export default function MySorobanReactProvider({
  children,
  ...rest
}: {
  children: React.ReactNode;
  [x: string]: any;
}) {


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