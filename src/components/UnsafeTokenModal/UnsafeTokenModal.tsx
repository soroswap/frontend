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
  isSafe: boolean | undefined;
}

const UnsafeTokenModalContent = ({ onDismiss, onConfirm, isSafe }: Props) => {
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
            Unsafe token!
          </SubHeaderLarge>
          {isSafe === false && (
            <SubHeaderSmall color={"textSecondary"} textAlign="center" marginBottom="12px">
              The chosen token has been identified as potentially unsafe due to a mismatch between its contract ID and the expected (CODE:ISSUER or CODE-ISSUER) combination indicated by its name.
            </SubHeaderSmall>
          )}
          {isSafe === undefined && (
            <SubHeaderSmall color={"textSecondary"} textAlign="center" marginBottom="12px">
              This token issuer can&apos;t be verified.
            </SubHeaderSmall>
          )}
        </AutoColumn>
        <ButtonPrimary onClick={onConfirm}>Accept risk</ButtonPrimary>
      </AutoColumn>
    </Wrapper>
  );
};

export default UnsafeTokenModalContent;
