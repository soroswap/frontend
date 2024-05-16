import { useContext, useState, useEffect } from 'react';

import { Box, CircularProgress, Modal, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useSorobanReact } from '@soroban-react/core';
import { AppContext } from 'contexts';
import Image from 'next/image';
import freighterLogoBlack from '../../assets/svg/FreighterWalletBlack.svg';
import freighterLogoWhite from '../../assets/svg/FreighterWalletWhite.svg';
import ModalBox from './ModalBox';
import { ButtonPrimary } from 'components/Buttons/Button';
import { AlertCircle } from 'react-feather';

import * as Bowser from 'bowser';
import { isConnected } from '@stellar/freighter-api';
import { isConnected as isConnectedLobstr } from '@lobstrco/signer-extension-api';

import { Connector } from '@soroban-react/types';

const Title = styled('div')`
  font-size: 24px;
  font-weight: 500;
`;
const Subtitle = styled('div')`
  font-size: 14px;
  font-weight: 500;
  & > span {
    display: block;
  }
`;

const Text = styled('div')`
  font-size: 12px;
  font-weight: 300;
  textwrap: wrap;
  & > span {
    display: block;
  }
`;
const Info = styled('div')`
  font-size: 10px;
  font-weight: 100;
  textwrap: wrap;
  & > span {
    display: block;
  }
`;

const ContentWrapper = styled('div')<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: Inter;
  text-align: ${({ isMobile }) => (isMobile ? 'center' : 'left')};
`;

const WalletBox = styled('div')`
  cursor: pointer;
  display: flex;
  background-color: ${({ theme }) => theme.palette.customBackground.surface};
  border-radius: 12px;
  padding: 16px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  align-self: stretch;
`;

const FooterText = styled('div')<{ isMobile: boolean }>`
  opacity: 0.5;
  font-size: 12px;
  font-weight: 600;
  text-align: ${({ isMobile }) => (isMobile ? 'center' : 'left')};
  & > span {
    color: ${({ theme }) => theme.palette.custom.textLinks};
  }
`;

export const ConnectWalletStyles = {
  Title,
  Subtitle,
  Text,
  Info,
  ContentWrapper,
  WalletBox,
  FooterText,
};

const ConnectWalletContent = ({
  isMobile,
  wallets,
  onError,
}: {
  isMobile: boolean;
  wallets?: Connector[];
  onError: any;
}) => {
  const theme = useTheme();
  const { ConnectWalletModal } = useContext(AppContext);
  const { setConnectWalletModalOpen } = ConnectWalletModal;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sorobanContext = useSorobanReact();
  const { setActiveConnectorAndConnect } = sorobanContext;
  const [walletsStatus, setWalletsStatus] = useState<
    { name: string; isInstalled: boolean; isLoading: boolean }[]
  >([
    { name: 'freighter', isInstalled: false, isLoading: true },
    { name: 'xbull', isInstalled: false, isLoading: true },
    { name: 'lobstr', isInstalled: false, isLoading: true },
  ]);
  const browser = Bowser.getParser(window.navigator.userAgent).getBrowserName();

  const installWallet = (wallet: any) => {
    if (wallet.id === 'freighter') {
      switch (browser) {
        case 'Firefox':
          window.open('https://addons.mozilla.org/en-US/firefox/addon/freighter/', '_blank');
          break;
        default:
          window.open(
            'https://chromewebstore.google.com/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk',
            '_blank',
          );
          break;
      }
    } else if (wallet.id === 'xbull') {
      switch (browser) {
        case 'Firefox':
          window.open('https://addons.mozilla.org/es/firefox/addon/xbull-wallet/', '_blank');
          break;
        default:
          window.open(
            'https://chromewebstore.google.com/detail/xbull-wallet/omajpeaffjgmlpmhbfdjepdejoemifpe',
            '_blank',
          );
          break;
      }
    } else if (wallet.id === 'lobstr') {
      switch (browser) {
        default:
          window.open(
            'https://chromewebstore.google.com/detail/lobstr-signer-extension/ldiagbjmlmjiieclmdkagofdjcgodjle',
            '_blank',
          );
          break;
      }
    }
    setTimeout(() => {
      window.location.reload();
    }, 30000);
  };

  const connectWallet = async (wallet: Connector) => {
    try {
      await setActiveConnectorAndConnect?.(wallet);
      setConnectWalletModalOpen(false);
    } catch (err) {
      const errorMessage = `${err}`;
      if (errorMessage.includes(`Error: Wallet hasn't been set upp`)) {
        onError(`Error: Wallet hasn't been set up. Please set up your xBull wallet.`);
      } else {
        onError('Something went wrong. Please try again.');
      }
    }
  };
  const handleClick = async (
    wallet: Connector,
    walletStatus: { name: string; isInstalled: boolean; isLoading: boolean } | undefined,
  ) => {
    if (!walletStatus) return;
    if (walletStatus.isLoading) return;

    const isWalletInstalled = walletStatus.isInstalled;

    if (isWalletInstalled) {
      connectWallet(wallet);
    } else {
      installWallet(wallet);
    }
  };

  useEffect(() => {
    const newWalletsStatus = walletsStatus.map(async (walletStatus) => {
      if (walletStatus.name === 'freighter') {
        const connected = await isConnected();
        return { name: walletStatus.name, isInstalled: connected, isLoading: false };
      }
      if (walletStatus.name === 'xbull') {
        if ((window as any).xBullSDK) {
          return { name: walletStatus.name, isInstalled: true, isLoading: false };
        }
      }
      if (walletStatus.name === 'lobstr') {
        const connected = await isConnectedLobstr();

        return { name: walletStatus.name, isInstalled: connected, isLoading: false };
      }
      return { ...walletStatus, isLoading: false };
    });

    Promise.all(newWalletsStatus).then((updatedWalletsStatus) => {
      setWalletsStatus(updatedWalletsStatus);
    });
  }, []);

  return (
    <ModalBox>
      <>
        <ContentWrapper isMobile={isMobile}>
          <Title>Connect a wallet to continue</Title>
          <Subtitle>
            Choose how you want to connect.{' '}
            <span>If you don’t have a wallet, you can select a provider and create one.</span>
          </Subtitle>
          {wallets?.map((wallet, index) => {
            const walletStatus = walletsStatus.find(
              (walletStatus) => walletStatus.name === wallet.id,
            );
            let walletIconUrl =
              theme.palette.mode == 'dark' ? freighterLogoWhite.src : freighterLogoBlack.src;
            if (wallet.id == 'lobstr') {
              walletIconUrl = 'https://stellar.creit.tech/wallet-icons/lobstr.svg';
            } else if (wallet.id == 'freighter') {
              walletIconUrl = 'https://stellar.creit.tech/wallet-icons/freighter.svg';
            } else if (wallet.id == 'xbull') {
              walletIconUrl = 'https://stellar.creit.tech/wallet-icons/xbull.svg';
            }

            return (
              <WalletBox key={index} onClick={() => handleClick(wallet, walletStatus)}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <Image src={walletIconUrl} width={24} height={24} alt={wallet.name + ' Wallet'} />
                  <span>{wallet.name} Wallet</span>
                </div>
                {walletStatus?.isInstalled ? (
                  <span style={{ color: theme.palette.custom.textQuaternary }}>Detected</span>
                ) : walletStatus?.isLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <span style={{ color: theme.palette.error.main }}>Install</span>
                )}
              </WalletBox>
            );
          })}
        </ContentWrapper>
        {/* TODO: add link to terms of service */}
        <FooterText isMobile={isMobile}>
          By connecting a wallet, you agree to Soroswap <span>Terms of Service</span>
        </FooterText>
      </>
    </ModalBox>
  );
};

const ErrorContent = ({
  isMobile,
  handleClick,
  errorMessage,
}: {
  isMobile: boolean;
  handleClick: () => void;
  errorMessage: string;
}) => {
  const theme = useTheme();
  return (
    <ModalBox>
      <ContentWrapper isMobile={isMobile}>
        <Box display="flex" alignItems="center" gap="16px">
          <AlertCircle size="32px" stroke={theme.palette.customBackground.accentCritical} />
          <Title>Connection Error</Title>
        </Box>
        <Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="8px"
            marginBottom="12px"
          >
            <Text style={{ textWrap: 'pretty' }}>{errorMessage}</Text>
          </Box>
          <ButtonPrimary onClick={handleClick} style={{ marginTop: 32 }}>
            Try again
          </ButtonPrimary>
        </Box>
      </ContentWrapper>
    </ModalBox>
  );
};

export default function ConnectWalletModal() {
  const theme = useTheme();
  const sorobanContext = useSorobanReact();
  const supportedWallets = sorobanContext.connectors;
  const { ConnectWalletModal } = useContext(AppContext);
  const { isConnectWalletModalOpen, setConnectWalletModalOpen } = ConnectWalletModal;

  const isMobile = useMediaQuery(theme.breakpoints.down(768));

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleError = (error: string) => {
    setErrorMessage(error);
  };

  return (
    <Modal
      open={isConnectWalletModalOpen}
      onClose={() => {
        setConnectWalletModalOpen(false);
        setErrorMessage(null);
      }}
      aria-labelledby="modal-wallet-connect"
      aria-describedby="modal-wallet-disconnect"
    >
      <div>
        {errorMessage ? (
          <ErrorContent
            isMobile={isMobile}
            handleClick={() => setErrorMessage(null)}
            errorMessage={errorMessage}
          />
        ) : (
          <ConnectWalletContent
            isMobile={isMobile}
            wallets={supportedWallets}
            onError={handleError}
          />
        )}
      </div>
    </Modal>
  );
}
