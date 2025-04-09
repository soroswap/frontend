import { AppBar, Toolbar, useMediaQuery } from 'soroswap-ui';

import { styled, useTheme } from 'soroswap-ui';
import ConnectWalletModal from 'components/Modals/ConnectWalletModal';
import SnackbarNotification from 'components/Notifications/SnackbarNotification';
import React, { useState } from 'react';
import background1 from '../../assets/images/bg1.png';
import Header from './Header';

const MainBackground = styled('main')<{ isMobile: boolean; showBanner: boolean }>`
  background-image: url(${background1.src});
  background-size: cover;
  min-height: ${({ isMobile }) => (isMobile ? 'calc(100vh - 78px)' : 'calc(100vh - 120px)')};
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100vw;
  padding: ${({ isMobile }) => (isMobile ? '50px 20px 50px 20px' : '65px 20px 50px 20px')};
  margin-top: ${({ isMobile, showBanner }) =>
    isMobile ? (showBanner ? '120px' : '78px') : showBanner ? '162px' : '120px'};
`;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(1220));

  const [showBanner, setShowBanner] = useState<boolean>(false);

  return (
    <>
      <AppBar
        enableColorOnDark
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: theme.palette.background.default,
          zIndex: theme.zIndex.drawer - 1,
        }}
      >
        {/* <Banner show={showBanner} setShow={setShowBanner} /> */}

        <Toolbar>
          <Header />
        </Toolbar>
      </AppBar>

      <ConnectWalletModal />
      <SnackbarNotification />

      <MainBackground isMobile={isMobile} theme={theme} showBanner={showBanner}>
        {children}
      </MainBackground>
    </>
  );
}
