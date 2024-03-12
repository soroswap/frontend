import { useMediaQuery } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { styled, useTheme } from '@mui/material/styles';
import ConnectWalletModal from 'components/Modals/ConnectWalletModal';
import SnackbarNotification from 'components/Notifications/SnackbarNotification';
import React, { useState } from 'react';
import background1 from '../../assets/images/bg1.png';
import Header from './Header';
import MobileDrawer from './MobileDrawer';
import Banner from './Banner';

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
  const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false);
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
        }}
      >
        {/* <Banner show={showBanner} setShow={setShowBanner} /> */}

        <Toolbar>
          <Header isDrawerOpen={isDrawerOpen} setDrawerOpen={setDrawerOpen} />
        </Toolbar>
      </AppBar>

      <ConnectWalletModal />
      <SnackbarNotification />

      <MobileDrawer isDrawerOpen={isDrawerOpen} setDrawerOpen={setDrawerOpen} />

      <MainBackground isMobile={isMobile} theme={theme} showBanner={showBanner}>
        {children}
      </MainBackground>
    </>
  );
}
