import React, { useMemo, useState } from "react";
import MainLayout from "../src/components/Layout/MainLayout";
import MySorobanReactProvider from "../src/soroban/MySorobanReactProvider";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { theme } from "../src/themes";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, AppContext } from "../src/contexts";
import { Provider } from 'react-redux'
import store from '../src/state'

export default function App({ Component, pageProps }: AppProps) {
  const [isConnectWalletModal, setConnectWalletModal] = useState<boolean>(false)
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    [],
  );

  const appContextValues = {
    ConnectWalletModal: {
      isConnectWalletModalOpen: isConnectWalletModal,
      setConnectWalletModalOpen: setConnectWalletModal
    }
  }

  return (
    <Provider store={store}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme(mode)}>
          <CssBaseline />
          <MySorobanReactProvider>
            <AppContext.Provider value={appContextValues}>
              <MainLayout>
                <Component {...pageProps} />
              </MainLayout>
            </AppContext.Provider>
          </MySorobanReactProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Provider>
  );
}
