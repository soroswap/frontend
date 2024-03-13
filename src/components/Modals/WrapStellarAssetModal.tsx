import { Box, CircularProgress, Modal, useTheme } from '@mui/material';
import { wrapStellarAsset } from '@soroban-react/contracts';
import { useSorobanReact } from '@soroban-react/core';
import { ButtonPrimary } from 'components/Buttons/Button';
import { CloseButton } from 'components/Buttons/CloseButton';
import { WalletButton } from 'components/Buttons/WalletButton';
import { AutoColumn } from 'components/Column';
import { RowBetween } from 'components/Row';
import { LoadingIndicatorOverlay, LogoContainer } from 'components/Swap/PendingModalContent/Logos';
import { SubHeaderLarge, SubHeaderSmall } from 'components/Text';
import { Wrapper } from 'components/TransactionConfirmationModal/ModalStyles';
import { AppContext, SnackbarIconType } from 'contexts';
import { sendNotification } from 'functions/sendNotification';
import useGetNativeTokenBalance from 'hooks/useGetNativeTokenBalance';
import { TokenType } from 'interfaces';
import Link from 'next/link';
import { useContext, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import { useSWRConfig } from 'swr';

interface Props {
  isOpen: boolean;
  asset: TokenType | undefined;
  onDismiss: () => void;
  onSuccess: () => void;
}

const WrapStellarAssetModal = ({ isOpen, asset, onDismiss, onSuccess }: Props) => {
  const [isWrapping, setIsWrapping] = useState<boolean>(false);
  const theme = useTheme();
  const sorobanContext = useSorobanReact();
  const { SnackbarContext, ConnectWalletModal } = useContext(AppContext);
  const { setConnectWalletModalOpen } = ConnectWalletModal;
  const { data } = useGetNativeTokenBalance();

  const { mutate } = useSWRConfig();

  const handleConfirm = () => {
    if (!asset?.issuer || asset.issuer == undefined) return;
    setIsWrapping(true);

    wrapStellarAsset({
      code: asset.code,
      issuer: asset.issuer,
      sorobanContext,
    })
      .then((result: any) => {
        if (!result) throw new Error('No result');
        mutate(
          (key: any) => {
            //refresh balance since wrap costs xlm
            return key.includes('balance');
          },
          undefined,
          { revalidate: true },
        );
        setIsWrapping(false);
        sendNotification(
          `${asset?.code} wrapped successfully`,
          'Token wrapped',
          SnackbarIconType.MINT,
          SnackbarContext,
        );
        onSuccess();
      })
      .catch((error) => {
        setIsWrapping(false);
      });
  };
  return (
    <Modal open={isOpen} onClose={onDismiss}>
      <Wrapper>
        <AutoColumn gap="12px">
          <RowBetween>
            <div />
            <CloseButton onClick={onDismiss} />
          </RowBetween>
          <Box display="flex" justifyContent="center">
            {isWrapping ? (
              <LogoContainer>
                <LoadingIndicatorOverlay />
              </LogoContainer>
            ) : (
              <AlertTriangle size="64px" stroke={theme.palette.customBackground.accentWarning} />
            )}
          </Box>
          <AutoColumn gap="12px" justify="center">
            <SubHeaderLarge color="textPrimary" textAlign="center">
              {isWrapping ? 'Wrapping' : 'Wrap Required'}
            </SubHeaderLarge>
            {isWrapping ? (
              <SubHeaderSmall color="textSecondary" textAlign="center" marginBottom="12px">
                Confirm transaction in your wallet
              </SubHeaderSmall>
            ) : (
              <SubHeaderSmall color="textSecondary" textAlign="center" marginBottom="12px">
                This token isn&apos;t yet wrapped for the Soroban network. Wrap it now for full
                trading capabilities.{' '}
                <Link
                  href={
                    'https://docs.soroswap.finance/05-tutorial/summary/01-wrapping-stellar-classic-assets'
                  }
                  target="_blank"
                  style={{ color: '#8866DD' }}
                >
                  Learn more
                </Link>
              </SubHeaderSmall>
            )}
          </AutoColumn>
          {sorobanContext.address ? (
            <ButtonPrimary
              onClick={handleConfirm}
              disabled={isWrapping || !data?.validAccount}
              style={{ gap: '1rem' }}
            >
              {isWrapping
                ? `Wrapping ${asset?.code}`
                : !data?.validAccount
                ? 'Insufficient balance'
                : `Wrap ${asset?.code}`}
              {isWrapping && <CircularProgress size="18px" />}
            </ButtonPrimary>
          ) : (
            <WalletButton />
          )}
        </AutoColumn>
      </Wrapper>
    </Modal>
  );
};

export default WrapStellarAssetModal;
