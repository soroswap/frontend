import { AppBar, Toolbar, useMediaQuery } from 'soroswap-ui';
import { styled, useTheme } from 'soroswap-ui';
import ConnectWalletModal from 'components/Modals/ConnectWalletModal';
import SnackbarNotification from 'components/Notifications/SnackbarNotification';
import React, { useState } from 'react';
import background1 from '../../assets/images/bg1.png';
import Header from './Header';

// Styled Footer component
const Footer = styled('footer')<{ isMobile: boolean }>`
  padding: ${({ isMobile }) => (isMobile ? '20px' : '30px')};
  text-align: center;
  width: 100%; // Ensure full width
  background: ${({ theme }) => theme.palette.background.paper};
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const MainBackground = styled('main')<{ isMobile: boolean; showBanner: boolean }>`
  background-image: url(${background1.src});
  background-size: cover;
  min-height: ${({ isMobile }) => (isMobile ? 'calc(100vh - 78px)' : 'calc(100vh - 120px)')};
  height: 100%;
  display: flex;
  flex-direction: column; // Stack vertically
  justify-content: space-between; // Push footer to bottom if content is short
  align-items: stretch; // Stretch children (content and footer) to full width
  width: 100vw;
  padding: ${({ isMobile }) => (isMobile ? '50px 20px 0 20px' : '65px 20px 0 20px')};
  margin-top: ${({ isMobile, showBanner }) =>
    isMobile ? (showBanner ? '120px' : '78px') : showBanner ? '162px' : '120px'};
`;

// Optional: Wrap content to control its alignment separately
const ContentWrapper = styled('div')`
  width: 100%;
  display: flex;
  justify-content: center; // Center content horizontally
  align-items: flex-start;
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
        sx={{ bgcolor: theme.palette.background.default }}
      >
        {/* <Banner show={showBanner} setShow={setShowBanner} /> */}
        <Toolbar>
          <Header />
        </Toolbar>
      </AppBar>

      <ConnectWalletModal />
      <SnackbarNotification />

      <MainBackground isMobile={isMobile} theme={theme} showBanner={showBanner}>
        <ContentWrapper>{children}</ContentWrapper> {/* Wrap children */}
        <Footer isMobile={isMobile}>
          <p>© {new Date().getFullYear()} Soroswap. All rights reserved.</p>
        </Footer>
      </MainBackground>
    </>
  );
}