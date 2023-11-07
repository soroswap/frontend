// import { t, Trans } from '@lingui/macro'
// import { ChainId, Currency } from '@uniswap/sdk-core'
// import { useWeb3React } from '@web3-react/core'
// import Badge from 'components/Badge'
// import { getChainInfo } from 'constants/chainInfo'
// import { SupportedL2ChainId } from 'constants/chains'
// import useCurrencyLogoURIs from 'lib/hooks/useCurrencyLogoURIs'
// import { ReactNode, useCallback, useState } from 'react'
// import { AlertCircle, ArrowUpCircle, CheckCircle } from 'react-feather'
// import { useIsTransactionConfirmed, useTransaction } from 'state/transactions/hooks'
// import { isL2ChainId } from 'utils/chains'
// import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

import { Modal, styled, useTheme } from '@mui/material';
import { useSorobanReact } from '@soroban-react/core';
import { ButtonLight, ButtonPrimary } from 'components/Buttons/Button';
import { CloseButton } from 'components/Buttons/CloseButton';
import { AutoColumn, ColumnCenter } from 'components/Column';
import Row, { RowBetween, RowFixed } from 'components/Row';
import { CustomLink } from 'components/Swap/PendingModalContent';
import {
  AnimatedEntranceConfirmationIcon,
  LoadingIndicatorOverlay,
} from 'components/Swap/PendingModalContent/Logos';
import { HeadlineMedium, SubHeader, SubHeaderLarge, SubHeaderSmall } from 'components/Text';
import { TokenType } from 'interfaces';
import { ReactNode, useState } from 'react';
import { CheckCircle, XCircle } from 'react-feather';

// import Circle from '../../assets/images/blue-loader.svg'
// import { ExternalLink, ThemedText } from '../../theme'
// import { CloseIcon, CustomLightSpinner } from '../../theme'
// import { TransactionSummary } from '../AccountDetails/TransactionSummary'
// import { ButtonLight, ButtonPrimary } from '../Button'
// import { AutoColumn, ColumnCenter } from '../Column'
// import Modal from '../Modal'
// import Row, { RowBetween, RowFixed } from '../Row'
// import AnimatedConfirmation from './AnimatedConfirmation'

const Wrapper = styled('div')`
  overflow: hidden;
  border-radius: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 40px);
  max-width: 420px;
  padding: 32px;
  background: ${({ theme }) => `linear-gradient(${theme.palette.customBackground.bg1}, ${
    theme.palette.customBackground.bg1
  }) padding-box,
              linear-gradient(150deg, rgba(136,102,221,1) 0%, rgba(${
                theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
              }) 35%, rgba(${
                theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
              }) 65%, rgba(136,102,221,1) 100%) border-box`};
  border: 1px solid transparent;
`;

const BottomSection = styled(AutoColumn)`
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`;

const CustomWrapper = styled(AutoColumn)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ConfirmedIcon = styled(ColumnCenter)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? '20px 0' : '32px 0;')};
  position: relative;
`;

const StyledLogo = styled('img')`
  height: 16px;
  width: 16px;
  margin-left: 6px;
`;

const ConfirmationModalContentWrapper = styled(AutoColumn)`
  padding-bottom: 12px;
`;

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
  //   if (!token?.symbol || !connector.watchAsset) return
  //   connector
  //     .watchAsset({
  //       address: token.address,
  //       symbol: token.symbol,
  //       decimals: token.decimals,
  //       image: logoURL,
  //     })
  //     .then(() => setSuccess(true))
  //     .catch(() => setSuccess(false))
  // }, [connector, logoURL, token])

  const href = 'https://google.com'; //TODO: getExplorerLink(chainId, swapResult.response.hash, ExplorerDataType.TRANSACTION)

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
                <RowFixed>Add {currencyToAdd.symbol}</RowFixed>
              ) : (
                <RowFixed>
                  Added {currencyToAdd.symbol}
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
            <CustomLink href={href} target="_blank">
              View on Explorer
            </CustomLink>
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

  // confirmation screen
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
