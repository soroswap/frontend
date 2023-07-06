import React, { useEffect, useRef, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { WalletData } from "@soroban-react/wallet-data";
import { useTheme } from "@mui/material/styles";
import { Avatar, Chip, ClickAwayListener, Paper, Popper } from "@mui/material";
import { SorobanContextType, useSorobanReact } from "@soroban-react/core";
import { shortenAddress } from "../../helpers/address";

export default function ProfileSection() {
  const theme = useTheme();
  const sorobanContext: SorobanContextType = useSorobanReact();
  console.log("🚀 « sorobanContext:", sorobanContext);

  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleClick = () => {
    if (sorobanContext.activeChain) {
      //HERE WALLET IS CONNECTED
      //TODO: Disconnect function not working
      sorobanContext.disconnect();
      console.log("Disconnected");
    } else {
      sorobanContext.connect();
      console.log("Connected");
    }
  };

  return (
    <>
      <Chip
        sx={{
          height: "37px",
          alignItems: "center",
          borderRadius: "10px",
          transition: "all .2s ease-in-out",
          borderColor: theme.palette.primary.light,
          backgroundColor: theme.palette.primary.light,
          '&[aria-controls="menu-list-grow"], &:hover': {
            borderColor: theme.palette.primary.main,
            background: `${theme.palette.primary.main}!important`,
            color: theme.palette.primary.light,
            "& svg": {
              stroke: theme.palette.primary.light,
            },
          },
          "& .MuiChip-label": {
            color: theme.palette.text.primary,
            fontSize: 14,
          },
        }}
        icon={
          sorobanContext.activeChain && (
            <Avatar
              src={"https://i.stack.imgur.com/frlIf.png"}
              sx={{
                width: "28px",
                height: "28px",
                fontSize: "1.2rem",
                margin: "8px 0 8px 8px !important",
                cursor: "pointer",
              }}
              ref={anchorRef}
              aria-controls={open ? "menu-list-grow" : undefined}
              aria-haspopup="true"
              color="inherit"
            />
          )
        }
        label={
          sorobanContext.activeChain ? (
            <div>
              <span style={{ display: "block" }}>
                {sorobanContext.activeChain.name}
              </span>
              {shortenAddress(sorobanContext.address ?? "")}
            </div>
          ) : (
            <div>Connect to a Wallet</div>
          )
        }
        variant="outlined"
        ref={anchorRef}
        aria-controls={open ? "menu-list-grow" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        color="primary"
      />
    </>
  );
}
