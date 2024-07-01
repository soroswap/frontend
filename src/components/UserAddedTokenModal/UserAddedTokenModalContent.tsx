import { Box, useTheme } from 'soroswap-ui';
import { ButtonPrimary } from 'components/Buttons/Button';
import { CloseButton } from 'components/Buttons/CloseButton';
import { AutoColumn } from 'components/Column';
import { RowBetween } from 'components/Row';
import { SubHeaderLarge, SubHeaderSmall } from 'components/Text';
import { Wrapper } from 'components/TransactionConfirmationModal/ModalStyles';
import { AlertTriangle } from 'react-feather';

interface Props {
  onDismiss: () => void;
  onConfirm: () => void;
}

const UserAddedTokenModalContent = ({ onDismiss, onConfirm }: Props) => {
  const theme = useTheme();
  return (
    <Wrapper>
      <AutoColumn gap="12px">
        <RowBetween>
          <div />
          <CloseButton onClick={onDismiss} />
        </RowBetween>
        <Box display="flex" justifyContent="center">
          <AlertTriangle size="64px" stroke={theme.palette.customBackground.accentCritical} />
        </Box>
        <AutoColumn gap="12px" justify="center">
          <SubHeaderLarge color="textPrimary" textAlign="center">
            Warning
          </SubHeaderLarge>
          <SubHeaderSmall color="textSecondary" textAlign="center" marginBottom="12px">
            This token isn&apos;t traded on leading U.S. centralized exchanges or frequently swapped
            on Soroswap. Always conduct your own research before trading.
          </SubHeaderSmall>
        </AutoColumn>
        <ButtonPrimary onClick={onConfirm}>I understand</ButtonPrimary>
      </AutoColumn>
    </Wrapper>
  );
};

export default UserAddedTokenModalContent;
