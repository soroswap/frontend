import { Analytics } from '@vercel/analytics/react';
import { AppContext, AppContextType, ColorModeContext, SnackbarIconType, ProtocolsStatus } from 'contexts';
import { Provider } from 'react-redux';
import { useMemo, useState } from 'react';
import InkathonProvider from 'inkathon/InkathonProvider';
import MainLayout from './Layout/MainLayout';
import MySorobanReactProvider from 'soroban/MySorobanReactProvider';
import store from 'state';
import { SorobanContextType } from '@soroban-react/core';
import { SoroswapThemeProvider } from 'soroswap-ui';

export default function Providers({
  children,
  sorobanReactProviderProps,
}: {
  children: React.ReactNode;
  sorobanReactProviderProps?: Partial<SorobanContextType>;
}) {
  const [isConnectWalletModal, setConnectWalletModal] = useState<boolean>(false);

  const [maxHops, setMaxHops] = useState<number>(2);
  const [protocolsStatus, setProtocolsStatus] = useState<ProtocolsStatus[]>([]);
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
