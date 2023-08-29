import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { styled, useTheme } from "@mui/material/styles";
import { Paper, Theme, useMediaQuery } from "@mui/material";
import Header from "./Header";

const Main = styled("main")`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  margin-top: 200px;
`

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();

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
          <Header/>
        </Toolbar>
      </AppBar>

      <Main theme={theme}>
        {children}
      </Main>
    </>
  );
}
