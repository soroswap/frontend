import { Analytics } from '@vercel/analytics/react';
import { AppContext, AppContextType, ColorModeContext, SnackbarIconType, ProtocolsStatus } from 'contexts';
import { Provider } from 'react-redux';
import { useEffect, useMemo, useState } from 'react';
import InkathonProvider from 'inkathon/InkathonProvider';
import MainLayout from './Layout/MainLayout';
import MySorobanReactProvider from 'soroban/MySorobanReactProvider';
import store from 'state';
import { SorobanContextType } from '@soroban-react/core';
import { SoroswapThemeProvider } from 'soroswap-ui';
import { Protocols } from 'soroswap-router-sdk';
import { PlatformType } from 'state/routing/types';

export default function Providers({
  children,
  sorobanReactProviderProps,
}: {
  children: React.ReactNode;
  sorobanReactProviderProps?: Partial<SorobanContextType>;
}) {
  const [isConnectWalletModal, setConnectWalletModal] = useState<boolean>(false);

  const [maxHops, setMaxHops] = useState<number>(2);

  //Defines the default protocols to be used in the app
  const defaultProtocols = [
    Protocols.SOROSWAP
  ]
  const [protocols, setProtocols] = useState<Protocols[]>(defaultProtocols);

  //Defines the default platforms to be used in the app
  const defaultProtocolsStatus: ProtocolsStatus[] = [
    { key: Protocols.SOROSWAP, value: true },
    { key: Protocols.PHOENIX, value: false },
    { key: PlatformType.STELLAR_CLASSIC, value: true },
  ]
  const [protocolsStatus, setProtocolsStatus] = useState<ProtocolsStatus[]>(defaultProtocolsStatus);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarTitle, setSnackbarTitle] = useState<string>('Swapped');
  const [snackbarType, setSnackbarType] = useState<SnackbarIconType>(SnackbarIconType.SWAP);

  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

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
      protocols,
      setProtocols,
      protocolsStatus,
      setProtocolsStatus,
    },
  };

  return (
    <Provider store={store}>
      <InkathonProvider>
        <ColorModeContext.Provider value={colorMode}>
          <SoroswapThemeProvider theme={mode}>
            <MySorobanReactProvider {...sorobanReactProviderProps}>
              <AppContext.Provider value={appContextValues}>
                <MainLayout>
                  {children}
                  <Analytics />
                </MainLayout>
              </AppContext.Provider>
            </MySorobanReactProvider>
          </SoroswapThemeProvider>
        </ColorModeContext.Provider>
      </InkathonProvider>
    </Provider>
  );
}
