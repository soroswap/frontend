import React, { useContext, useRef, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Chip } from "@mui/material";
import { SorobanContextType, useSorobanReact } from "@soroban-react/core";
import { shortenAddress } from "../../helpers/address";
import { AppContext } from "contexts";

export default function ProfileSection() {
  const theme = useTheme();
  const { ConnectWalletModal } = useContext(AppContext)
  const sorobanContext: SorobanContextType = useSorobanReact();

  const anchorRef = useRef(null);

  const { isConnectWalletModalOpen, setConnectWalletModalOpen } = ConnectWalletModal;

  const handleClick = () => {
    if (sorobanContext.activeChain) {
      //HERE WALLET IS CONNECTED
      //TODO: Disconnect function not working
      sorobanContext.disconnect();
      console.log("Disconnected");
    } else {
      setConnectWalletModalOpen(true)
    }
  };

  return (
    <>
      <Chip
        sx={{
          display: 'inline-flex',
          height: 56,
          padding: '16px 24px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
          borderRadius: "16px",
          backgroundColor: '#8866DD',
          '&[aria-controls="menu-list-grow"], &:hover': {
            color: theme.palette.primary.light,
            "& svg": {
              stroke: theme.palette.primary.light,
            },
          },
          "& .MuiChip-label": {
            color: "#FFFFFF",
            fontSize: 20,
            fontFamily: "Inter",
            fontWeight: 600,
            lineHeight: '140%', 
          },
          ":hover": {
            backgroundColor: '#8866DD',
          }
        }}
        label={
          sorobanContext.activeChain ? (
            <div>
              {shortenAddress(sorobanContext.address ?? "")}
            </div>
          ) : (
            <div>Connect wallet</div>
          )
        }
        ref={anchorRef}
        onClick={handleClick}
      />
    </>
  );
}
