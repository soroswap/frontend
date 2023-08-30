import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { styled, useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import Header from "./Header";
import background1 from '../../assets/images/bg1.png'
import ConnectWalletModal from "components/Modals/ConnectWalletModal";

const MainBackground = styled("main")<{ isMobile: boolean }>`
  background-image: url(${background1.src});
  background-size: cover;
  height: ${({ isMobile }) => isMobile ? 'calc(100vh - 78px)' : 'calc(100vh - 120px)'};
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100vw;
  padding-top: 100px;
  margin-top: ${({ isMobile }) => isMobile ? '78px' : '120px'};
`

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
          <Header />
        </Toolbar>
      </AppBar>

      <ConnectWalletModal />

      <MainBackground isMobile={isMobile} theme={theme}>
        {children}
      </MainBackground>
    </>
  );
}
