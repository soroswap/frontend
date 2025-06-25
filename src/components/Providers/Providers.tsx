import { ColorModeContext } from 'contexts';
import { Provider } from 'react-redux';
import { useMemo, useState } from 'react';
// import InkathonProvider from 'inkathon/InkathonProvider';
import MySorobanReactProvider from 'soroban/MySorobanReactProvider';
import store from 'state';
import { SorobanContextType } from 'stellar-react';
import { SoroswapThemeProvider } from 'soroswap-ui';
import ContextProvider from './ContextProvider';

export default function Providers({
  children,
  sorobanReactProviderProps,
}: {
  children: React.ReactNode;
  sorobanReactProviderProps?: Partial<SorobanContextType>;
}) {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  return (
    <Provider store={store}>
      {/* <InkathonProvider> */}
        <ColorModeContext.Provider value={colorMode}>
          <SoroswapThemeProvider theme={mode}>
            <MySorobanReactProvider {...sorobanReactProviderProps}>
              <ContextProvider>
                {children}
              </ContextProvider>
            </MySorobanReactProvider>
          </SoroswapThemeProvider>
        </ColorModeContext.Provider>
      {/* </InkathonProvider> */}
    </Provider>
  );
}
