// import { Trans } from '@lingui/macro'
// import { ButtonPrimary } from 'components/Button'
// import { ColumnCenter } from 'components/Column'
// import QuestionHelper from 'components/QuestionHelper'
// import Row from 'components/Row'
// import { AlertTriangle } from 'react-feather'
// import { ThemedText } from 'theme'

import { useTheme } from 'soroswap-ui';
import { PendingModalContainer } from '.';
import { AlertTriangle } from 'react-feather';
import { ColumnCenter } from 'components/Column';
import { Caption, HeadlineSmall } from 'components/Text';
import Row from 'components/Row';
import { ButtonPrimary } from 'components/Buttons/SwapButtonNew';

export enum PendingModalError {
  TOKEN_APPROVAL_ERROR,
  PERMIT_ERROR,
  CONFIRMATION_ERROR,
  WRAP_ERROR,
}

interface ErrorModalContentProps {
  errorType: PendingModalError;
  onRetry: () => void;
}

function getErrorContent(errorType: PendingModalError) {
  switch (errorType) {
    case PendingModalError.TOKEN_APPROVAL_ERROR:
      return {
        title: 'Token approval failed',
        label: 'Why are approvals required?',
        tooltipText: (
          <>
            This provides the Uniswap protocol access to your token for trading. For security, this
            will expire after 30 days.
          </>
        ),
      };
    case PendingModalError.PERMIT_ERROR:
      return {
        title: 'Permit approval failed',
        label: 'Why are permits required?',
        tooltipText: (
          <>
            Permit2 allows token approvals to be shared and managed across different applications.
          </>
        ),
      };
    case PendingModalError.CONFIRMATION_ERROR:
      return {
        title: 'Swap failed',
      };
    case PendingModalError.WRAP_ERROR:
      return {
        title: 'Wrap failed',
      };
  }
}

export function ErrorModalContent({ errorType, onRetry }: ErrorModalContentProps) {
  const theme = useTheme();

  const { title, label, tooltipText } = getErrorContent(errorType);

  return (
    <PendingModalContainer gap="lg">
      <AlertTriangle
        data-testid="pending-modal-failure-icon"
        strokeWidth={1}
        color={theme.palette.error.main}
        size="48px"
      />
      <ColumnCenter gap="md">
        <HeadlineSmall>{title}</HeadlineSmall>
        <Row justify="center">
          {label && <Caption color="textSecondary">{label}</Caption>}
          {/* {tooltipText && <QuestionHelper text={tooltipText} />} */}
        </Row>
      </ColumnCenter>
      <Row justify="center">
        <ButtonPrimary onClick={onRetry}>Retry</ButtonPrimary>
      </Row>
    </PendingModalContainer>
  );
}
