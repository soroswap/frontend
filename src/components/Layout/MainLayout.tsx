// MainLayout.tsx
import { AppBar, Toolbar, useMediaQuery } from 'soroswap-ui';
import { styled, useTheme } from 'soroswap-ui';
import ConnectWalletModal from 'components/Modals/ConnectWalletModal';
import SnackbarNotification from 'components/Notifications/SnackbarNotification';
import React, { useState } from 'react';
import background1 from '../../assets/images/bg1.png';
import Header from './Header';
import Footer from './Footer'; // Import the new Footer component

// Styled MainBackground
const MainBackground = styled('main')<{ isMobile: boolean; showBanner: boolean }>`
  background-image: url(${background1.src});
  background-size: cover;
  min-height: ${({ isMobile }) => (isMobile ? 'calc(100vh - 78px)' : 'calc(100vh - 120px)')};
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch; // Stretch children to full width
  width: 100vw; // Use viewport width directly
  padding: ${({ isMobile }) => (isMobile ? '50px 20px 0 20px' : '65px 20px 0 20px')};
  margin-top: ${({ isMobile, showBanner }) =>
    isMobile ? (showBanner ? '120px' : '78px') : showBanner ? '162px' : '120px'};
  margin-left: 0; // Ensure no offset
  margin-right: 0; // Ensure no offset
  box-sizing: border-box;
  overflow-x: hidden; // Match globals.css
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
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          {children}
        </div>
      </MainBackground>
      <Footer isMobile={isMobile} />
    </>
  );
}