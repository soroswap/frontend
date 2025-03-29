import React, { useMemo, useState } from 'react';
import { Provider } from 'react-redux';
import { Box, Typography, Card, CardContent, Divider, Paper, styled } from 'soroswap-ui';
import { ColorModeContext } from 'contexts';
import InkathonProvider from 'inkathon/InkathonProvider';
import { StellarWalletsKitProvider, useStellarWalletsKit } from 'soroban/StellarWalletsKitProvider';
import { SWKWalletButton } from '../src/components/Buttons/SWKWalletButton';
import { SoroswapThemeProvider } from 'soroswap-ui';
import store from 'state';
import SEO from 'components/SEO';

const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80vh',
  padding: theme.spacing(3),
  gap: theme.spacing(3),
  backgroundColor: theme.palette.background.default
}));

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 600,
  marginTop: theme.spacing(3),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  width: '100%',
  maxWidth: 600,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
  overflow: 'hidden',
  wordBreak: 'break-all'
}));


function WalletInfo() {
  const { 
    address, 
    activeChain, 
    selectedWalletId, 
    isConnected 
  } = useStellarWalletsKit();

  if (!isConnected || !address) {
    return (
      <StyledPaper>
        <Typography variant="subtitle1" color="textSecondary" align="center">
          Connect your wallet to view information
        </Typography>
      </StyledPaper>
    );
  }

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Wallet Information
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" color="textSecondary">
          Address:
        </Typography>
        <StyledPaper>
          <Typography variant="body2">{address}</Typography>
        </StyledPaper>
        
        <Typography variant="subtitle2" color="textSecondary">
          Active Network:
        </Typography>
        <StyledPaper>
          <Typography variant="body2">{activeChain.name}</Typography>
        </StyledPaper>
        
        <Typography variant="subtitle2" color="textSecondary">
          Network Passphrase:
        </Typography>
        <StyledPaper>
          <Typography variant="body2">{activeChain.networkPassphrase}</Typography>
        </StyledPaper>
        
        <Typography variant="subtitle2" color="textSecondary">
          Selected Wallet:
        </Typography>
        <StyledPaper>
          <Typography variant="body2">{selectedWalletId || 'Not available'}</Typography>
        </StyledPaper>
      </CardContent>
    </StyledCard>
  );
}

export default function TestSWKPage() {
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
    <>
      <SEO title="Test SWK - Soroswap" description="Testing Stellar Wallets Kit" />
      <Provider store={store}>
        <InkathonProvider>
          <ColorModeContext.Provider value={colorMode}>
            <SoroswapThemeProvider theme={mode}>
              <StellarWalletsKitProvider>
                <StyledContainer>
                  <Typography variant="h4" component="h1" gutterBottom>
                    Stellar Wallets Kit Test
                  </Typography>
                  
                  <SWKWalletButton />
                  
                  <WalletInfo />
                  
                  <Box sx={{ maxWidth: 600, textAlign: 'center', mt: 4 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      This page demonstrates the Stellar Wallets Kit integration.
                      Connect your wallet to verify its functionality.
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      If everything is working correctly, you will see your wallet information above.
                    </Typography>
                  </Box>
                </StyledContainer>
              </StellarWalletsKitProvider>
            </SoroswapThemeProvider>
          </ColorModeContext.Provider>
        </InkathonProvider>
      </Provider>
    </>
  );
}