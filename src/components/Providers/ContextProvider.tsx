import { Analytics } from '@vercel/analytics/react';
import { AppContext, AppContextType, SnackbarIconType, ProtocolsStatus } from 'contexts';
import { useEffect, useMemo, useState } from 'react';
import MainLayout from '../Layout/MainLayout';
import { useSorobanReact } from '@soroban-react/core';
import config from 'configs/protocols.config.json'
import { Protocols } from 'soroswap-router-sdk';
import { PlatformType } from 'state/routing/types';
import { useAggregator } from 'hooks/useAggregator';


export default function ContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const sorobanContext = useSorobanReact();
  const { activeChain } = sorobanContext;
  const { isEnabled: isAggregator } = useAggregator();
  const [isConnectWalletModal, setConnectWalletModal] = useState<boolean>(false);
  const [maxHops, setMaxHops] = useState<number>(2);
  const [protocolsStatus, setProtocolsStatus] = useState<ProtocolsStatus[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarTitle, setSnackbarTitle] = useState<string>('Swapped');
  const [snackbarType, setSnackbarType] = useState<SnackbarIconType>(SnackbarIconType.SWAP);

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
    },
  };

  const defaultProtocolsStatus: ProtocolsStatus[] = useMemo(() => {
    if (activeChain?.id === 'testnet') {
      return config['testnet'] as ProtocolsStatus[];
    } else {
      return config['mainnet'] as ProtocolsStatus[];
    }
  }, [activeChain]);

  useEffect(() => {
    let protocols: ProtocolsStatus[] = [];
    for (let protocol of defaultProtocolsStatus) {
      const key = protocol.key;
      protocols.push({
        key: key.toLocaleLowerCase() === 'sdex' ? PlatformType.STELLAR_CLASSIC : key,
        value: protocol.value,
      });
    }
    if (isAggregator === false) {
      switch (activeChain?.id) {
        case 'testnet':
          protocols = protocols.filter((protocol) => protocol.key == Protocols.SOROSWAP);
          break;
        case 'mainnet':
          protocols = protocols.filter((protocol) => protocol.key == Protocols.SOROSWAP || protocol.key == PlatformType.STELLAR_CLASSIC);
          break;
      }
    }
    if (activeChain?.id == 'testnet') {
      protocols = protocols.filter((protocol) => protocol.key != PlatformType.STELLAR_CLASSIC);
    }
    setProtocolsStatus(protocols);
  }, [defaultProtocolsStatus, isAggregator, activeChain?.id]);

  return (
    <AppContext.Provider value={appContextValues}>
      <MainLayout>
        {children}
        <Analytics />
      </MainLayout>
    </AppContext.Provider>
  );
}
