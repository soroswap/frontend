import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { styled, useTheme } from "@mui/material/styles";
import { Paper, Theme, useMediaQuery } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }: { theme: Theme; open: boolean }) => ({
    backgroundColor: theme.palette.background.default,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
    marginTop: "68px",
    minHeight: "calc(100vh - 68px)",
    flexGrow: 1,
    padding: "20px",
    marginRight: "20px",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    transition: theme.transitions.create(
      "margin",
      open
        ? {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }
        : {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          },
    ),
    [theme.breakpoints.up("md")]: {
      marginLeft: open ? 0 : 260,
      width: open ? "100%" : `calc(100% - ${260}px)`,
    },
    [theme.breakpoints.down("md")]: {
      marginTop: 56,
    },
  }),
);

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const [drawerState, setDrawerState] = useState<boolean>(false);

  const handleDrawerToggle = () => {
    setDrawerState((prev) => !prev);
  };

  const matchDownMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <>
      <AppBar
        enableColorOnDark
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: theme.palette.background.default,
          transition: drawerState ? theme.transitions.create("width") : "none",
        }}
      >
        <Toolbar>
          <Header handleDrawerToggle={handleDrawerToggle} />
        </Toolbar>
      </AppBar>

      <Sidebar
        drawerState={!matchDownMd ? !drawerState : drawerState}
        drawerToggle={handleDrawerToggle}
      />

      <Main theme={theme} open={drawerState}>
        {/* <Paper></Paper> */}
        {children}
      </Main>
    </>
  );
}
