import React from "react";
import MainLayout from "../src/components/Layout/MainLayout";
import MySorobanReactProvider from "../src/soroban/MySorobanReactProvider";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { theme } from "../src/themes";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext } from "../src/contexts";
import { Provider } from 'react-redux'
import store from '../src/state'

export default function App({ Component, pageProps }: AppProps) {
  const [mode, setMode] = React.useState<"light" | "dark">("dark");
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    [],
  );

  return (
    <Provider store={store}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme(mode)}>
          <CssBaseline />
          <MySorobanReactProvider>
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          </MySorobanReactProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Provider>
  );
}
