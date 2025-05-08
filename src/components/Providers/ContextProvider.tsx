import { Analytics } from '@vercel/analytics/react';
import { AppContext, AppContextType, SnackbarIconType, ProtocolsStatus } from 'contexts';
import { useEffect, useMemo, useState } from 'react';
import MainLayout from '../Layout/MainLayout';
import { PlatformType, Protocol } from 'state/routing/types';
import { useSorobanReact, WalletNetwork } from 'stellar-react';
import config from 'configs/protocols.config.json';
import { useAggregator } from 'hooks/useAggregator';

export default function ContextProvider({ children }: { children: React.ReactNode }) {
  const sorobanContext = useSorobanReact();
  const { activeNetwork } = sorobanContext;
  const { isEnabled: isAggregator, address } = useAggregator();
  const [isConnectWalletModal, setConnectWalletModal] = useState<boolean>(false);
  const [maxHops, setMaxHops] = useState<number>(2);
  const [protocolsStatus, setProtocolsStatus] = useState<ProtocolsStatus[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarTitle, setSnackbarTitle] = useState<string>('Swapped');
  const [snackbarType, setSnackbarType] = useState<SnackbarIconType>(SnackbarIconType.SWAP);
  const [isAggregatorState, setAggregatorStatus] = useState<boolean>(isAggregator);
  const [aggregatorAddress, setAggregatorAddress] = useState<string | undefined>(address);

  useEffect(() => {
    setAggregatorStatus(isAggregator);
  }, [isAggregator]);


  const appContextValues: AppContextType = {
    ConnectWalletModal: {
      isConnectWalletModalOpen: isConnectWalletModal,
      setConnectWalletModalOpen: setConnectWalletModal,
    },
    SnackbarContext: {
      openSnackbar,
      snackbarMessage,
      snackbarTitle,
      snackbarType,
      setOpenSnackbar,
      setSnackbarMessage,
      setSnackbarTitle,
      setSnackbarType,
    },
    Settings: {
      maxHops,
      setMaxHops,
      protocolsStatus,
      setProtocolsStatus,
      isAggregatorState,
      setAggregatorStatus,
      aggregatorAddress,
      setAggregatorAddress
    },
  };

  const defaultProtocolsStatus: ProtocolsStatus[] = useMemo(() => {
    if (activeNetwork === WalletNetwork.TESTNET) {
      return config['testnet'] as ProtocolsStatus[];
    } else {
      return config['mainnet'] as ProtocolsStatus[];
    }
  }, [activeNetwork]);

  useEffect(() => {
    let protocols: ProtocolsStatus[] = [];
    for (let protocol of defaultProtocolsStatus) {
      const key = protocol.key;
      protocols.push({
        key: key.toLocaleLowerCase() === 'sdex' ? PlatformType.STELLAR_CLASSIC : key,
        value: protocol.value,
        url: protocol.url,
      });
    }
    address && setAggregatorAddress(address);
    if (isAggregator === false) {
      switch (activeNetwork) {
        case WalletNetwork.TESTNET:
          protocols = protocols.filter((protocol) => protocol.key == Protocol.SOROSWAP);
          break;
        case WalletNetwork.PUBLIC:
          protocols = protocols.filter(
            (protocol) =>
              protocol.key == Protocol.SOROSWAP || protocol.key == PlatformType.STELLAR_CLASSIC,
          );
          break;
      }
    }
    if (activeNetwork == WalletNetwork.TESTNET) {
      protocols = protocols.filter((protocol) => protocol.key != PlatformType.STELLAR_CLASSIC);
    }
    setProtocolsStatus(protocols);
  }, [defaultProtocolsStatus, isAggregator, activeNetwork]);

  return (
    <AppContext.Provider value={appContextValues}>
      <MainLayout>
        {children}
        <Analytics />
      </MainLayout>
    </AppContext.Provider>
  );
}
