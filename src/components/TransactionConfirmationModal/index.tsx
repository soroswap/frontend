import { Box, Modal, useTheme } from '@mui/material';
import { useSorobanReact } from '@soroban-react/core';
import { ButtonLight, ButtonPrimary } from 'components/Buttons/Button';
import { CloseButton } from 'components/Buttons/CloseButton';
import { AutoColumn } from 'components/Column';
import CopyTxHash from 'components/CopyTxHash/CopyTxHash';
import Row, { RowBetween, RowFixed } from 'components/Row';
import {
  AnimatedEntranceConfirmationIcon,
  LoadingIndicatorOverlay,
} from 'components/Swap/PendingModalContent/Logos';
import { HeadlineMedium, SubHeader, SubHeaderLarge, SubHeaderSmall } from 'components/Text';
import { TokenType } from 'interfaces';
import { ReactNode, useState } from 'react';
import { CheckCircle, XCircle } from 'react-feather';
import {
  BottomSection,
  ConfirmationModalContentWrapper,
  ConfirmedIcon,
  CustomWrapper,
  Wrapper,
} from './ModalStyles';

export const TransactionFailedContent = ({ onDismiss }: { onDismiss: () => void }) => {
  const theme = useTheme();

  return (
    <Wrapper>
      <AutoColumn>
        <RowBetween>
          <div />
          <CloseButton onClick={onDismiss} />
        </RowBetween>
        <ConfirmationModalContentWrapper gap="12px" justify="center">
          <RowFixed>
            <XCircle
              size="64px"
              stroke={theme.palette.customBackground.accentCritical}
              style={{ marginLeft: '6px' }}
            />
          </RowFixed>
          <HeadlineMedium textAlign="center">Transaction Failed</HeadlineMedium>

          <ButtonPrimary
            onClick={onDismiss}
            style={{ margin: '20px 0 0 0' }}
            data-testid="dismiss-tx-confirmation"
          >
            Close
          </ButtonPrimary>
        </ConfirmationModalContentWrapper>
      </AutoColumn>
    </Wrapper>
  );
};

function ConfirmationPendingContent({
  onDismiss,
  pendingText,
  inline,
}: {
  onDismiss: () => void;
  pendingText: ReactNode;
  inline?: boolean; // not in modal
}) {
  return (
    <Wrapper>
      <AutoColumn gap="12px">
        {!inline && (
          <RowBetween>
            <div />
            <CloseButton onClick={onDismiss} />
          </RowBetween>
        )}
        <ConfirmedIcon inline={inline}>
          <LoadingIndicatorOverlay />
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify="center">
          <SubHeaderLarge color="textPrimary" textAlign="center">
            Waiting for confirmation
          </SubHeaderLarge>
          <SubHeader color="textPrimary" textAlign="center" component="div">
            {pendingText}
          </SubHeader>
          <SubHeaderSmall color="textSecondary" textAlign="center" marginBottom="12px">
            Confirm this transaction in your wallet
          </SubHeaderSmall>
        </AutoColumn>
      </AutoColumn>
    </Wrapper>
  );
}

function TransactionSubmittedContent({
  onDismiss,
  hash,
  currencyToAdd,
  inline,
}: {
  onDismiss: () => void;
  hash?: string;
  currencyToAdd?: TokenType;
  inline?: boolean; // not in modal
}) {
  const theme = useTheme();

  const { activeChain } = useSorobanReact();

  // const token = currencyToAdd?.wrapped
  // const logoURL = useCurrencyLogoURIs(token)[0]

  const [success, setSuccess] = useState<boolean | undefined>();

  // const addToken = useCallback(() => {
  //   if (!token?.code || !connector.watchAsset) return
  //   connector
  //     .watchAsset({
  //       address: token.contract,
  //       symbol: token.code,
  //       decimals: token.decimals,
  //       image: logoURL,
  //     })
  //     .then(() => setSuccess(true))
  //     .catch(() => setSuccess(false))
  // }, [connector, logoURL, token])

  return (
    <Wrapper>
      <AutoColumn>
        {!inline && (
          <RowBetween>
            <div />
            <CloseButton onClick={onDismiss} />
          </RowBetween>
        )}
        <ConfirmedIcon inline={inline}>
          <AnimatedEntranceConfirmationIcon />
        </ConfirmedIcon>
        <ConfirmationModalContentWrapper gap="12px" justify="center">
          <HeadlineMedium textAlign="center">Transaction submitted</HeadlineMedium>
          {currencyToAdd && activeChain && (
            <ButtonLight
              margin-top="12px"
              padding="6px 12px"
              width="fit-content"
              onClick={() => null}
            >
              {!success ? (
                <RowFixed>Add {currencyToAdd.code}</RowFixed>
              ) : (
                <RowFixed>
                  Added {currencyToAdd.code}
                  <CheckCircle
                    size="16px"
                    stroke={theme.palette.customBackground.accentSuccess}
                    style={{ marginLeft: '6px' }}
                  />
                </RowFixed>
              )}
            </ButtonLight>
          )}
          <ButtonPrimary
            onClick={onDismiss}
            style={{ margin: '20px 0 0 0' }}
            data-testid="dismiss-tx-confirmation"
          >
            {inline ? 'Return' : 'Close'}
          </ButtonPrimary>
          {hash && (
            <Box>
              <CopyTxHash txHash={hash} />
            </Box>
          )}
        </ConfirmationModalContentWrapper>
      </AutoColumn>
    </Wrapper>
  );
}

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent,
  headerContent,
}: {
  title: ReactNode;
  onDismiss: () => void;
  topContent: () => ReactNode;
  bottomContent?: () => ReactNode;
  headerContent?: () => ReactNode;
}) {
  return (
    <Wrapper>
      <CustomWrapper>
        <Row>
          {headerContent?.()}
          <Row justify="left">
            <SubHeader>{title}</SubHeader>
          </Row>
          <CloseButton onClick={onDismiss} data-testid="confirmation-close-icon" />
        </Row>
        {topContent()}
      </CustomWrapper>
      {bottomContent && <BottomSection gap="12px">{bottomContent()}</BottomSection>}
    </Wrapper>
  );
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  hash?: string;
  reviewContent: () => ReactNode;
  attemptingTxn: boolean;
  pendingText: ReactNode;
  currencyToAdd?: TokenType;
  txError?: boolean;
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  reviewContent,
  currencyToAdd,
  txError,
}: ConfirmationModalProps) {
  const sorobanContext = useSorobanReact();
  const { activeChain } = sorobanContext;
  if (!activeChain) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onDismiss}
      aria-labelledby="transaction-confirmation-modal"
      aria-describedby="transaction-confirmation-modal"
    >
      <>
        {attemptingTxn ? (
          <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
        ) : hash ? (
          <TransactionSubmittedContent
            hash={hash}
            onDismiss={onDismiss}
            currencyToAdd={currencyToAdd}
          />
        ) : txError ? (
          <TransactionFailedContent onDismiss={onDismiss} />
        ) : (
          reviewContent()
        )}
      </>
    </Modal>
  );
}

// Waiting for confirmation
// Removing 0.0249999 DERC and0.00000243951 ETH
// Confirm this transaction in your wallet
