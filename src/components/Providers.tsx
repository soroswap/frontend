import { Analytics } from '@vercel/analytics/react';
import { AppContext, AppContextType, ColorModeContext, SnackbarIconType } from 'contexts';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';
import { theme } from 'themes';
import { useMemo, useState } from 'react';
import InkathonProvider from 'inkathon/InkathonProvider';
import MainLayout from './Layout/MainLayout';
import MySorobanReactProvider from 'soroban/MySorobanReactProvider';
import store from 'state';
import { SorobanContextType } from '@soroban-react/core';
import '../../styles/globals.css';

export default function Providers({
  children,
  sorobanReactProviderProps,
}: {
  children: React.ReactNode;
  sorobanReactProviderProps?: Partial<SorobanContextType>;
}) {
  const [isConnectWalletModal, setConnectWalletModal] = useState<boolean>(false);

  const [maxHops, setMaxHops] = useState<number>(2);

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
    },
  };

  return (
    <Provider store={store}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme(mode)}>
          <CssBaseline />
          <MySorobanReactProvider {...sorobanReactProviderProps}>
            <InkathonProvider>
              <AppContext.Provider value={appContextValues}>
                <MainLayout>
                  {children}
                  <Analytics />
                </MainLayout>
              </AppContext.Provider>
            </InkathonProvider>
          </MySorobanReactProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Provider>
  );
}
