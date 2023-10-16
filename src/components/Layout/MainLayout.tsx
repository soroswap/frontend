import { useMediaQuery } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { styled, useTheme } from "@mui/material/styles";
import ConnectWalletModal from "components/Modals/ConnectWalletModal";
import SnackbarNotification from "components/Notifications/SnackbarNotification";
import React, { useState } from "react";
import background1 from '../../assets/images/bg1.png';
import Header from "./Header";
import MobileDrawer from "./MobileDrawer";

const MainBackground = styled("main")<{ isMobile: boolean }>`
  background-image: url(${background1.src});
  background-size: cover;
  height: ${({ isMobile }) => isMobile ? 'calc(100vh - 78px)' : 'calc(100vh - 120px)'};
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100vw;
  padding: ${({ isMobile }) => isMobile ? '50px 20px 0 20px' : '100px 20px 0 20px'};
  margin-top: ${({ isMobile }) => isMobile ? '78px' : '120px'};
`

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false)
  const isMobile = useMediaQuery(theme.breakpoints.down(1220));

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
        <Toolbar>
          <Header isDrawerOpen={isDrawerOpen} setDrawerOpen={setDrawerOpen} />
        </Toolbar>
      </AppBar>

      <ConnectWalletModal />
      <SnackbarNotification />

      <MobileDrawer isDrawerOpen={isDrawerOpen} setDrawerOpen={setDrawerOpen} />

      <MainBackground isMobile={isMobile} theme={theme}>
        {children}
      </MainBackground>
    </>
  );
}
