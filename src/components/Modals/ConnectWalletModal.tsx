import { useContext, useEffect, useState } from 'react';

import { useSorobanReact } from 'soroban-react-stellar-wallets-kit';
import { Connector } from 'soroban-react-stellar-wallets-kit';
import { ButtonPrimary } from 'components/Buttons/Button';
import { AppContext } from 'contexts';
import Image from 'next/image';
import { AlertCircle } from 'react-feather';
import { walletConnectors } from 'soroban/MySorobanReactProvider';
import { Box, CircularProgress, Modal, styled, useMediaQuery, useTheme } from 'soroswap-ui';
import ModalBox from './ModalBox';

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

const buildWalletsStatus = () => {
  return walletConnectors.map((w) => ({
    isInstalled: false,
    isLoading: true,
    name: w.id,
    connector: w,
  }));
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
  const sorobanContext = useSorobanReact();
  const { setActiveConnectorAndConnect } = sorobanContext;
  const [walletsStatus, setWalletsStatus] = useState<
    { name: string; isInstalled: boolean; isLoading: boolean }[]
  >(buildWalletsStatus());

  const installWallet = (wallet: Connector) => {
    window.open(wallet.downloadUrls?.browserExtension, '_blank');
  };

  const connectWallet = async (wallet: Connector) => {
    try {
      setActiveConnectorAndConnect?.(wallet);
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
      const contextConnector = sorobanContext.connectors.find((c) => c.id === walletStatus.name);

      if (contextConnector) {
        let connected = await contextConnector.isConnected();

        return { name: walletStatus.name, isInstalled: connected, isLoading: false };
      }

      return { ...walletStatus, isLoading: false };
    });

    Promise.all(newWalletsStatus).then((updatedWalletsStatus) => {
      setWalletsStatus(updatedWalletsStatus as any);
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
            let walletIconUrl = wallet.iconUrl as string;

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
