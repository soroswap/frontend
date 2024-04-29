/* eslint-disable @next/next/no-img-element */
import {
  SubstrateWallet,
  allSubstrateWallets,
  getSubstrateChain,
  isWalletInstalled,
  nightlyConnect,
  useInkathon,
} from '@scio-labs/use-inkathon';
import { Box, CircularProgress, Modal, useMediaQuery, useTheme } from '@mui/material';
import { ButtonPrimary } from 'components/Buttons/Button';
import { ButtonText } from 'components/Text';
import { ConnectWalletStyles } from 'components/Modals/ConnectWalletModal';
import { useSorobanReact } from '@soroban-react/core';
import { useState } from 'react';
import ModalBox from 'components/Modals/ModalBox';
import useBoolean from 'hooks/useBoolean';

const { Title, Subtitle, ContentWrapper, WalletBox, FooterText } = ConnectWalletStyles;

export function ConnectPendulumWalletButton() {
  const { address } = useSorobanReact();

  const { connect } = useInkathon();

  const [connectingWallet, setConnectingWallet] = useState<SubstrateWallet | undefined>();

  const handleConnect = async (wallet: SubstrateWallet) => {
    if (!isWalletInstalled(wallet)) {
      window.open(wallet.urls.website, '_blank');
      return;
    }

    const substrateChain = getSubstrateChain('pendulum');

    setConnectingWallet(wallet);

    await connect?.(substrateChain, wallet);

    setConnectingWallet(undefined);
    walletModal.setFalse();
  };

  const getWallets = () => {
    return allSubstrateWallets?.filter((wallet) => wallet.id !== nightlyConnect.id);
  };

  const walletModal = useBoolean();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(768));

  return (
    <>
      <Modal open={walletModal.value} onClose={walletModal.setFalse}>
        <div>
          <ModalBox>
            <ContentWrapper isMobile={isMobile}>
              <Title>Connect a wallet to continue</Title>
              <Subtitle>
                Choose how you want to connect.{' '}
                <span>If you don’t have a wallet, you can select a provider and create one.</span>
              </Subtitle>
              <Box
                maxHeight={300}
                overflow="auto"
                pr={2}
                display="flex"
                flexDirection="column"
                gap="24px"
                className="custom-scrollbar"
              >
                {getWallets()?.map?.((wallet) => (
                  <WalletBox key={wallet.name} onClick={() => handleConnect(wallet)}>
                    <Box display="flex" gap={1}>
                      <img src={wallet.logoUrls[0]} alt={wallet.name} width={24} height={24} />
                      <span>{wallet.name}</span>
                    </Box>
                    {isWalletInstalled(wallet) ? (
                      <>
                        {connectingWallet?.id === wallet.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <span style={{ color: theme.palette.custom.textQuaternary }}>
                            Detected
                          </span>
                        )}
                      </>
                    ) : (
                      <span style={{ color: theme.palette.error.main }}>Install</span>
                    )}
                  </WalletBox>
                ))}
              </Box>
            </ContentWrapper>
            <FooterText isMobile={isMobile}>
              By connecting a wallet, you agree to Soroswap <span>Terms of Service</span>
            </FooterText>
          </ModalBox>
        </div>
      </Modal>
      <div>
        <ButtonPrimary onClick={walletModal.setTrue} sx={{ height: '64px' }} disabled={!address}>
          <ButtonText fontSize={20} fontWeight={600}>
            Connect Pendulum Wallet
          </ButtonText>
        </ButtonPrimary>
      </div>
    </>
  );
}
