import React from "react";
import Typography from "@mui/material/Typography";

import { useTheme } from "@mui/material/styles";
import { Box, Chip, Drawer, Stack, useMediaQuery } from "@mui/material";
import MenuList from "./MenuList";
import logo from '../../assets/images/soroswap-circle-no-background.png'


interface SidebarProps {
  drawerState: boolean;
  drawerToggle: () => void;
}

export default function Sidebar({ drawerState, drawerToggle }: SidebarProps) {
  console.log("🚀 « drawerToggle:", drawerToggle);
  console.log("🚀 « drawerState:", drawerState);
  const theme = useTheme();

  const matchUpMd = useMediaQuery(theme.breakpoints.up("md"));

  const drawer = (
    <>
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <Box
          component="span"
          sx={{ display: { xs: "block", md: "none" }, flexGrow: 1 }}
        >
          <img
            src={logo.src}
            height={64}
            width={64}
            alt={"Soroswap"}
          />
        </Box>

        <Box component="span" sx={{ display: { xs: "block", md: "none" } }}>
          <Typography variant="h6" component="div">
            Soroswap AMM
          </Typography>
        </Box>
      </Box>
      {/* <BrowserView> */}
      {/* <PerfectScrollbar
          component="div"
          style={{
            height: !matchUpMd ? 'calc(100vh - 56px)' : 'calc(100vh - 88px)',
            paddingLeft: '16px',
            paddingRight: '16px'
          }}
        > */}
      <MenuList />
      {/* <MenuCard /> */}
      <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
        <Chip
          label={"1.2.3"}
          disabled
          size="small"
          sx={{ cursor: "pointer" }}
        />
      </Stack>
      {/* </PerfectScrollbar> */}
      {/* </BrowserView> */}
      {/* <MobileView>
        <Box sx={{ px: 2 }}>
          <MenuList />
          <MenuCard />
          <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
            <Chip label={process.env.REACT_APP_VERSION} disabled chipcolor="secondary" size="small" sx={{ cursor: 'pointer' }} />
          </Stack>
        </Box>
      </MobileView> */}
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ flexShrink: { md: 0 }, width: matchUpMd ? 260 : "auto" }}
      aria-label="mailbox folders"
    >
      <Drawer
        variant={matchUpMd ? "persistent" : "temporary"}
        anchor="left"
        open={drawerState}
        onClose={drawerToggle}
        sx={{
          "& .MuiDrawer-paper": {
            width: 260,
            background: theme.palette.primary.dark,
            color: theme.palette.text.primary,
            borderRight: "none",
            [theme.breakpoints.up("md")]: {
              top: "68px",
            },
          },
        }}
        ModalProps={{ keepMounted: true }}
        color="inherit"
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
