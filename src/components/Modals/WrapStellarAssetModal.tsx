import { Box, Modal, useTheme } from '@mui/material';
import { useSorobanReact } from '@soroban-react/core';
import { ButtonPrimary } from 'components/Buttons/Button';
import { CloseButton } from 'components/Buttons/CloseButton';
import { AutoColumn } from 'components/Column';
import { RowBetween } from 'components/Row';
import { SubHeaderLarge, SubHeaderSmall } from 'components/Text';
import { Wrapper } from 'components/TransactionConfirmationModal/ModalStyles';
import { wrapClassicStellarAsset } from 'helpers/stellar';
import { TokenType } from 'interfaces';
import Link from 'next/link';
import { AlertTriangle } from 'react-feather';

interface Props {
  isOpen: boolean;
  asset: TokenType | undefined;
  onDismiss: () => void;
  onSuccess: () => void;
}

const WrapStellarAssetModal = ({ isOpen, asset, onDismiss, onSuccess }: Props) => {
  const theme = useTheme();
  const sorobanContext = useSorobanReact();

  const handleConfirm = () => {
    console.log("TRYING TO WRAP")
    wrapClassicStellarAsset(asset, sorobanContext)
      .then((result: any) => {
        console.log(result)
        onSuccess();
      })
      .catch((error) => {
        console.log("ERROR WRAPPING", error)
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
            <AlertTriangle size="64px" stroke={theme.palette.customBackground.accentWarning} />
          </Box>
          <AutoColumn gap="12px" justify="center">
            <SubHeaderLarge color="textPrimary" textAlign="center">
              Wrap Required
            </SubHeaderLarge>
            <SubHeaderSmall color="textSecondary" textAlign="center" marginBottom="12px">
              This token isn&apos;t yet wrapped for the Soroban network. Wrap it now for full trading capabilities.
              {' '}
              <Link href={'https://docs.soroswap.finance'} target='_blank' style={{ color: '#8866DD' }}>Learn more</Link>
            </SubHeaderSmall>
          </AutoColumn>
          <ButtonPrimary onClick={handleConfirm}>Wrap {asset?.symbol}</ButtonPrimary>
        </AutoColumn>
      </Wrapper>
    </Modal>
  );
};

export default WrapStellarAssetModal;
