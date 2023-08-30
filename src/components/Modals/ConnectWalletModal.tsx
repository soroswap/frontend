import React, { useContext } from "react";

import { styled, useTheme } from "@mui/material/styles";
import { Box, Modal } from "@mui/material";
import { AppContext } from "contexts";
import ModalBox from "./ModalBox";
import freighterLogo from '../../assets/svg/FreighterWallet.svg'
import Image from "next/image";
import { useSorobanReact } from "@soroban-react/core";


const Title = styled('div')`
  font-size: 24px;
  font-weight: 500;
`
const Subtitle = styled('div')`
  font-size: 14px;
  font-weight: 500;
  & > span {
    display: block
  }
`

const ContentWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: Inter;
  text-align: left;
`

const WalletBox = styled('div')`
  cursor: pointer;
  display: flex;
  background-color: ${({ theme }) => theme.palette.customBackground.surface};
  border-radius: 12px;
  padding: 16px;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  align-self: stretch;
`

const FooterText = styled('div')`
  opacity: 0.5;
  font-size: 12px;
  font-weight: 600;
  & > span {
    color: ${({theme}) => theme.palette.custom.borderColor}
  }
`

export default function ConnectWalletModal() {
  const theme = useTheme();
  const sorobanContext = useSorobanReact()
  const { ConnectWalletModal } = useContext(AppContext)
  const { isConnectWalletModalOpen, setConnectWalletModalOpen } = ConnectWalletModal

  const handleClick = () => {
    setConnectWalletModalOpen(false)
    sorobanContext.connect()
  }


  return (
    <Modal
      open={isConnectWalletModalOpen}
      onClose={() => setConnectWalletModalOpen(false)}
      aria-labelledby="modal-wallet-connect"
      aria-describedby="modal-wallet-disconnect"
    >
      <ModalBox>
        <ContentWrapper>
          <Title>Connect a wallet to continue</Title>
          <Subtitle>Choose how you want to connect. <span>If you don’t have a wallet, you can select a provider and create one.</span></Subtitle>
          <WalletBox onClick={() => handleClick()}>
            <div style={{display: "flex", gap: "16px"}}>
              <Image src={freighterLogo.src} width={24} height={24} alt="Freighter Wallet" />
              <span>Freighter Wallet</span>
            </div>
            {/* TODO: If detected wallet show detected or if it has to be installed */}
            <span style={{color: theme.palette.customBackground.accentSuccess}}>Detected</span>
          </WalletBox>
        </ContentWrapper>
        {/* TODO: add link to terms of service */}
        <FooterText>By connecting a wallet, you agree to Soroswap <span>Terms of Service</span></FooterText>
      </ModalBox>
    </Modal>
  );
}
