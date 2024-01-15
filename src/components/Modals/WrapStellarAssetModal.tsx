import { Box, CircularProgress, Modal, useTheme } from '@mui/material';
import { wrapStellarAsset } from '@soroban-react/contracts';
import { useSorobanReact } from '@soroban-react/core';
import { ButtonPrimary } from 'components/Buttons/Button';
import { CloseButton } from 'components/Buttons/CloseButton';
import { AutoColumn } from 'components/Column';
import { RowBetween } from 'components/Row';
import { LoadingIndicatorOverlay, LogoContainer } from 'components/Swap/PendingModalContent/Logos';
import { SubHeaderLarge, SubHeaderSmall } from 'components/Text';
import { Wrapper } from 'components/TransactionConfirmationModal/ModalStyles';
import { getClassicStellarAsset } from 'helpers/address';
import { TokenType } from 'interfaces';
import Link from 'next/link';
import { useState } from 'react';
import { AlertTriangle } from 'react-feather';

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

  const handleConfirm = () => {
    console.log("TRYING TO WRAP")
    const stellarAsset = getClassicStellarAsset(asset?.name!);
    if (!stellarAsset) return;
    setIsWrapping(true);

    wrapStellarAsset({
      code: stellarAsset.assetCode,
      issuer: stellarAsset.issuer,
      sorobanContext
    })
      .then((result: any) => {
        if (!result) throw new Error("No result");
        setIsWrapping(false);
        onSuccess();
      })
      .catch((error) => {
        setIsWrapping(false);
      })      
  }
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
              {isWrapping ? "Wrapping" : "Wrap Required"}
            </SubHeaderLarge>
            {isWrapping ? (
              <SubHeaderSmall color="textSecondary" textAlign="center" marginBottom="12px">
                Confirm transaction in your wallet
              </SubHeaderSmall>
            ): (    
              <SubHeaderSmall color="textSecondary" textAlign="center" marginBottom="12px">
                This token isn&apos;t yet wrapped for the Soroban network. Wrap it now for full trading capabilities.
                {' '}
                {/* //TODO: Add learn more link */}
                <Link href={'https://docs.soroswap.finance'} target='_blank' style={{ color: '#8866DD' }}>Learn more</Link>
              </SubHeaderSmall>
            )}
          </AutoColumn>
          <ButtonPrimary
            onClick={handleConfirm}
            disabled={isWrapping}
            style={{ gap: "1rem"}}
          >
            {isWrapping ? `Wrapping ${asset?.symbol}` : `Wrap ${asset?.symbol}`}
            {isWrapping && (
              <CircularProgress size="18px" />
            )}
          </ButtonPrimary>
        </AutoColumn>
      </Wrapper>
    </Modal>
  );
};

export default WrapStellarAssetModal;
