import { css, keyframes, styled, useTheme } from '@mui/material';
import Column, { ColumnCenter } from 'components/Column';
import CopyTxHash from 'components/CopyTxHash/CopyTxHash';
import Row from 'components/Row';
import { LabelSmall, SubHeaderLarge } from 'components/Text';
import { SuccessfullSwapResponse } from 'hooks/useSwapCallback';
import { TokenType } from 'interfaces';
import Link from 'next/link';
import { ReactNode, useRef } from 'react';
import { InterfaceTrade } from 'state/routing/types';
import { ConfirmModalState } from '../ConfirmSwapModal';
import {
  AnimatedEntranceConfirmationIcon,
  AnimationType,
  CurrencyLoader,
  LoadingIndicatorOverlay,
  LogoContainer,
} from './Logos';
import { TradeSummary } from './TradeSummary';

export const PendingModalContainer = styled(ColumnCenter)`
  margin: 48px 0 8px;
`;

const HeaderContainer = styled(ColumnCenter, {
  shouldForwardProp: (prop) => prop !== '$disabled',
})<{ $disabled?: boolean }>`
  ${({ $disabled }) => $disabled && `opacity: 0.5;`}
  gap: 10px;
  overflow: visible;
`;

const StepCircle = styled('div')<{ active: boolean }>`
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background-color: ${({ theme, active }) =>
    active ? theme.palette.customBackground.accentAction : theme.palette.custom.textTertiary};
  outline: 3px solid
    ${({ theme, active }) =>
      active
        ? theme.palette.customBackground.accentActionSoft
        : theme.palette.custom.accentTextLightTertiary};
  transition: background-color 250ms ease-in-out;
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(40px) }
  to { opacity: 1; transform: translateX(0px) }
`;
const slideInAnimation = css`
  animation: from { opacity: 0; transform: translateX(40px) } to { opacity: 1; transform: translateX(0px) } 250ms ease-in-out;
`;
const slideOut = keyframes`
  from { opacity: 1; transform: translateX(0px) }
  to { opacity: 0; transform: translateX(-40px) }
`;
const slideOutAnimation = css`
  animation: from { opacity: 1; transform: translateX(0px) } to { opacity: 0; transform: translateX(-40px) } 250ms ease-in-out;
`;

const AnimationWrapper = styled('div')`
  position: relative;
  width: 100%;
  min-height: 72px;
  display: flex;
  flex-grow: 1;
`;

export const CustomLink = styled(Link)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const StepTitleAnimationContainer = styled(Column, {
  shouldForwardProp: (prop) => prop !== 'disableEntranceAnimation',
})<{ disableEntranceAnimation?: boolean }>`
  position: relative;
  width: 100%;
  align-items: center;
  transition: display 250ms ease-in-out;
  ${({ disableEntranceAnimation }) =>
    !disableEntranceAnimation &&
    css`
      ${slideInAnimation}
    `}

  &.${AnimationType.EXITING} {
    ${slideOutAnimation}
  }
`;

// This component is used for all steps after ConfirmModalState.REVIEWING
export type PendingConfirmModalState = Extract<
  ConfirmModalState,
  | ConfirmModalState.SETTING_TRUSTLINE
  | ConfirmModalState.PERMITTING
  | ConfirmModalState.PENDING_CONFIRMATION
  | ConfirmModalState.WRAPPING
  | ConfirmModalState.RESETTING_USDT
>;

interface PendingModalStep {
  title: ReactNode;
  subtitle?: ReactNode;
  label?: ReactNode;
  logo?: ReactNode;
  button?: ReactNode;
}

interface PendingModalContentProps {
  steps?: PendingConfirmModalState[];
  currentStep?: any; // The type of currentStep is inferred based on the values passed to it when the function is called.
  trade?: InterfaceTrade;
  swapResult?: any; //SwapResult
  wrapTxHash?: string;
  hideStepIndicators?: boolean;
  tokenApprovalPending?: boolean;
  revocationPending?: boolean;
}

interface ContentArgs {
  step: PendingConfirmModalState;
  approvalCurrency?: TokenType;
  trade?: InterfaceTrade;
  swapConfirmed: boolean;
  swapPending: boolean;
  wrapPending: boolean;
  tokenApprovalPending: boolean;
  revocationPending: boolean;
  swapResult?: SuccessfullSwapResponse; //SwapResult
  chainId?: number;
  order?: any; //UniswapXOrderDetails
}

function getContent(args: ContentArgs): PendingModalStep {
  const {
    step,
    wrapPending,
    approvalCurrency,
    swapConfirmed,
    swapPending,
    tokenApprovalPending,
    revocationPending,
    trade,
    swapResult,
  } = args;

  switch (step) {
    case ConfirmModalState.WRAPPING:
      return {
        title: `Wrap ETH`,
        subtitle: (
          <CustomLink href="https://support.uniswap.org/hc/en-us/articles/16015852009997">
            Why is this required?
          </CustomLink>
        ),
        label: wrapPending ? `Pending...` : `Proceed in your wallet`,
      };
    case ConfirmModalState.RESETTING_USDT:
      return {
        title: `Reset USDT`,
        subtitle: `USDT requires resetting approval when spending limits are too low.`,
        label: revocationPending ? `Pending...` : `Proceed in your wallet`,
      };
    case ConfirmModalState.SETTING_TRUSTLINE:
      return {
        title: `Setting trustline for ${approvalCurrency?.code ?? 'this token'}`,
        subtitle: (
          <CustomLink
            href="https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts#trustlines"
            target="_blank"
          >
            Why is this required?
          </CustomLink>
        ),
        label: tokenApprovalPending ? `Pending...` : `Proceed in your wallet`,
      };
    case ConfirmModalState.PERMITTING:
      return {
        title: `Allow ${approvalCurrency?.code ?? 'this token'} to be used for swapping`,
        subtitle: (
          <CustomLink
            href="https://support.uniswap.org/hc/en-us/articles/8120520483085"
            target="_blank"
          >
            Why is this required?
          </CustomLink>
        ),
        label: `Proceed in your wallet`,
      };
    case ConfirmModalState.PENDING_CONFIRMATION: {
      let label: React.ReactNode | null | string = null;

      if (swapConfirmed && swapResult) {
        label = <CopyTxHash txHash={swapResult?.txHash} />;
      } else if (swapPending) {
        label = `Proceed in your wallet`;
      }

      return {
        title: swapPending
          ? `Waiting for confirmation`
          : swapConfirmed
          ? `Success`
          : `Waiting for confirmation`,
        subtitle: trade ? <TradeSummary trade={trade} swapResult={swapResult} /> : null,
        label,
      };
    }
  }
}

export function PendingModalContent({
  steps,
  currentStep,
  trade,
  swapResult,
  wrapTxHash,
  hideStepIndicators,
  tokenApprovalPending = false,
  revocationPending = false,
}: PendingModalContentProps) {
  // const { chainId } = useWeb3React()

  // const classicSwapConfirmed = useIsTransactionConfirmed(
  //   swapResult?.type === TradeFillType.Classic ? swapResult.response.hash : undefined
  // )
  // const wrapConfirmed = useIsTransactionConfirmed(wrapTxHash)
  // const uniswapXSwapConfirmed = Boolean(swapResult)

  const swapConfirmed = swapResult ? true : false;

  const swapPending = !swapResult ? true : false;
  const wrapPending = false; //wrapTxHash != undefined && !wrapConfirmed

  const { label, button } = getContent({
    step: currentStep,
    approvalCurrency: trade?.inputAmount?.currency,
    swapConfirmed,
    swapPending,
    wrapPending,
    tokenApprovalPending,
    revocationPending,
    swapResult,
    trade,
  });
  const theme = useTheme();

  // const order = useOrder(swapResult?.type === TradeFillType.UniswapX ? swapResult.response.orderHash : '')

  const currentStepContainerRef = useRef<HTMLDivElement>(null);
  // useUnmountingAnimation(currentStepContainerRef, () => AnimationType.EXITING)

  // if (steps.length === 0) {
  //   return null
  // }

  // // Return finalized-order-specifc content if available
  // if (order && order.status !== UniswapXOrderStatus.OPEN) {
  //   return <OrderContent order={{ status: order.status, orderHash: order.orderHash, details: order }} />
  // }

  // // On mainnet, we show the success icon once the tx is sent, since it takes longer to confirm than on L2s.
  const showSuccess = swapConfirmed || !swapPending;

  return (
    <PendingModalContainer gap="24px">
      <LogoContainer>
        {currentStep !== ConfirmModalState.PENDING_CONFIRMATION && trade && trade.inputAmount && (
          <CurrencyLoader
            currency={trade.outputAmount?.currency}
            asBadge={currentStep === ConfirmModalState.SETTING_TRUSTLINE}
          />
        )}
        {currentStep === ConfirmModalState.PENDING_CONFIRMATION && showSuccess && (
          <AnimatedEntranceConfirmationIcon />
        )}
        {(currentStep === ConfirmModalState.PENDING_CONFIRMATION ||
          tokenApprovalPending ||
          wrapPending ||
          revocationPending) &&
          !showSuccess && <LoadingIndicatorOverlay />}
      </LogoContainer>
      <HeaderContainer
        $disabled={(revocationPending || tokenApprovalPending || wrapPending) && !showSuccess}
      >
        {trade && trade.inputAmount && (
          <AnimationWrapper>
            {steps?.map((step) => {
              const { title, subtitle } = getContent({
                step,
                approvalCurrency: trade?.outputAmount?.currency,
                swapConfirmed,
                swapPending,
                wrapPending,
                revocationPending,
                tokenApprovalPending,
                swapResult,
                trade,
              });
              // We only render one step at a time, but looping through the array allows us to keep
              // the exiting step in the DOM during its animation.
              return (
                Boolean(step === currentStep) && (
                  <StepTitleAnimationContainer
                    disableEntranceAnimation={steps[0] === currentStep}
                    gap="12px"
                    key={step}
                    ref={step === currentStep ? currentStepContainerRef : undefined}
                  >
                    <SubHeaderLarge
                      textAlign="center"
                      data-testid="pending-modal-content-title"
                      component="div"
                    >
                      {title}
                    </SubHeaderLarge>
                    <LabelSmall textAlign="center" component="div">
                      {subtitle}
                    </LabelSmall>
                  </StepTitleAnimationContainer>
                )
              );
            })}
          </AnimationWrapper>
        )}
        <div
          style={{
            fontSize: 14,
            fontFamily: 'Inter',
            color: theme.palette.custom.accentTextLightSecondary,
          }}
        >
          {label}
        </div>
      </HeaderContainer>
      {button && <Row justify="center">{button}</Row>}
      {!hideStepIndicators && !showSuccess && (
        <Row gap="14px" justify="center">
          {steps?.map((_, i) => {
            return <StepCircle key={i} active={steps.indexOf(currentStep) === i} />;
          })}
        </Row>
      )}
    </PendingModalContainer>
  );
}
