// import { Trans } from '@lingui/macro' //This is for localization and translation on all languages
import { Modal } from 'soroswap-ui';
import { styled } from 'soroswap-ui';
import { useSorobanReact } from 'soroban-react-stellar-wallets-kit';
import { ConfirmationModalContent } from 'components/TransactionConfirmationModal';
import { TokenType } from 'interfaces';
import { useCallback, useEffect, useState } from 'react';
import { InterfaceTrade } from 'state/routing/types';
import { Field } from 'state/swap/actions';
import { RowBetween, RowFixed } from '../Row';
import { PendingConfirmModalState, PendingModalContent } from './PendingModalContent';
import { PendingModalError } from './PendingModalContent/ErrorModalContent';
import SwapModalFooter from './SwapModalFooter';
import SwapModalHeader from './SwapModalHeader';

const StyledSwapHeader = styled(RowBetween)(({ theme }) => ({
  marginBottom: 10,
  color: theme.palette.secondary.main,
}));

const HeaderButtonContainer = styled(RowFixed)`
  padding: 0 12px;
  gap: 16px;
`;

export enum ConfirmModalState {
  REVIEWING,
  WRAPPING,
  RESETTING_USDT,
  SETTING_TRUSTLINE,
  PERMITTING,
  PENDING_CONFIRMATION,
}

export function useConfirmModalState({
  trade,
  allowedSlippage,
  onSwap,
  onSetTrustline,
  trustline,
  doesTradeDiffer,
  onCurrencySelection,
}: {
  trade: InterfaceTrade;
  allowedSlippage: any; //Percent
  onSwap: () => void;
  onSetTrustline: () => void;
  trustline: boolean; //Allowance
  doesTradeDiffer?: boolean;
  onCurrencySelection: (field: Field, currency: TokenType) => void;
}) {
  const sorobanContext = useSorobanReact();
  const [confirmModalState, setConfirmModalState] = useState<ConfirmModalState>(
    ConfirmModalState.REVIEWING,
  );
  const [approvalError, setApprovalError] = useState<PendingModalError>();
  const [pendingModalSteps, setPendingModalSteps] = useState<PendingConfirmModalState[]>([]);

  // This is a function instead of a memoized value because we do _not_ want it to update as the allowance changes.
  // For example, if the user needs to complete 3 steps initially, we should always show 3 step indicators
  // at the bottom of the modal, even after they complete steps 1 and 2.
  const generateRequiredSteps = useCallback(() => {
    const steps: PendingConfirmModalState[] = [];
    if (trustline) {
      steps.push(ConfirmModalState.SETTING_TRUSTLINE);
    }
    steps.push(ConfirmModalState.PENDING_CONFIRMATION);
    return steps;
  }, [trustline]);

  const resetStates = () => {
    setConfirmModalState(ConfirmModalState.REVIEWING);
    setApprovalError(undefined);
    setPendingModalSteps([]);
  };

  // const { chainId } = useWeb3React()
  // const trace = useTrace()
  // const maximumAmountIn = useMaxAmountIn(trade, allowedSlippage)

  // const nativeCurrency = useNativeCurrency(chainId)

  const [wrapTxHash, setWrapTxHash] = useState<string>();
  const [onSetTrustlineExecuted, setOnSetTrustlineExecuted] = useState<boolean>(false);

  // const { execute: onWrap } = useWrapCallback(
  //   nativeCurrency,
  //   trade.inputAmount.currency,
  //   formatCurrencyAmount(trade.inputAmount, NumberType.SwapTradeAmount)
  // )
  // const wrapConfirmed = useIsTransactionConfirmed(wrapTxHash)
  // const prevWrapConfirmed = usePrevious(wrapConfirmed)
  const catchUserReject = async (e: any, errorType: PendingModalError) => {
    setConfirmModalState(ConfirmModalState.REVIEWING);
    // if (didUserReject(e)) return
    setApprovalError(errorType);
  };

  const performStep = useCallback(
    async (step: ConfirmModalState) => {
      switch (step) {
        case ConfirmModalState.WRAPPING:
          setConfirmModalState(ConfirmModalState.WRAPPING);
          break;
        case ConfirmModalState.RESETTING_USDT:
          setConfirmModalState(ConfirmModalState.RESETTING_USDT);
          break;
        case ConfirmModalState.SETTING_TRUSTLINE:
          setConfirmModalState(ConfirmModalState.SETTING_TRUSTLINE);
          try {
            onSetTrustline();
            setOnSetTrustlineExecuted(true);
          } catch (e) {
            catchUserReject(e, PendingModalError.CONFIRMATION_ERROR);
          }
          break;
        case ConfirmModalState.PERMITTING:
          setConfirmModalState(ConfirmModalState.PERMITTING);
          break;
        case ConfirmModalState.PENDING_CONFIRMATION:
          setConfirmModalState(ConfirmModalState.PENDING_CONFIRMATION);
          try {
            onSwap();
            setOnSetTrustlineExecuted(false);
          } catch (e) {
            catchUserReject(e, PendingModalError.CONFIRMATION_ERROR);
          }
          break;
        default:
          setConfirmModalState(ConfirmModalState.REVIEWING);
          break;
      }
    },
    [onSetTrustline, onSwap],
  );

  const startSwapFlow = useCallback(() => {
    const steps = generateRequiredSteps();
    setPendingModalSteps(steps);
    performStep(steps[0]);
  }, [generateRequiredSteps, performStep]);

  useEffect(() => {
    // If the trustline step finished, trigger the next step (swap).
    if (!trustline && onSetTrustlineExecuted) {
      performStep(pendingModalSteps[1]);
    }
  }, [onSetTrustlineExecuted, pendingModalSteps, performStep, trustline]);

  const onCancel = () => {
    setConfirmModalState(ConfirmModalState.REVIEWING);
    setApprovalError(undefined);
  };

  return {
    startSwapFlow,
    onCancel,
    confirmModalState,
    approvalError,
    pendingModalSteps,
    wrapTxHash,
    resetStates,
  };
}

export default function ConfirmSwapModal({
  trade,
  inputCurrency,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  trustline,
  onConfirm,
  onSetTrustline,
  onDismiss,
  onCurrencySelection,
  swapError,
  swapResult,
  networkFees,
  swapQuoteReceivedDate,
  fiatValueInput,
  fiatValueOutput,
  useConfirmModal,
}: {
  trade: InterfaceTrade;
  inputCurrency?: TokenType;
  originalTrade?: InterfaceTrade;
  swapResult?: any; //SwapResult
  networkFees: number | null;
  allowedSlippage: any; //Percent
  trustline: boolean;
  onAcceptChanges: () => void;
  onConfirm: () => void;
  onSetTrustline: () => void;
  swapError?: Error;
  onDismiss: () => void;
  onCurrencySelection: (field: Field, currency: TokenType) => void;
  swapQuoteReceivedDate?: Date;
  fiatValueInput: { data?: number; isLoading: boolean };
  fiatValueOutput: { data?: number; isLoading: boolean };
  useConfirmModal: any;
}) {
  const {
    startSwapFlow,
    onCancel,
    confirmModalState,
    approvalError,
    pendingModalSteps,
    wrapTxHash,
  } = useConfirmModal;

  const swapFailed = Boolean(swapError); // && !didUserReject(swapError)

  // const showAcceptChanges = Boolean(
  //   trade && confirmModalState !== ConfirmModalState.PENDING_CONFIRMATION
  // )
  const showAcceptChanges = false;
  const modalHeader = useCallback(() => {
    if (confirmModalState !== ConfirmModalState.REVIEWING && !showAcceptChanges) {
      return null;
    }
    return (
      <SwapModalHeader
        inputCurrency={inputCurrency}
        trade={trade}
        allowedSlippage={allowedSlippage}
      />
    );
  }, [allowedSlippage, confirmModalState, showAcceptChanges, trade, inputCurrency]);

  const modalBottom = useCallback(() => {
    if (confirmModalState === ConfirmModalState.REVIEWING || showAcceptChanges) {
      return (
        <SwapModalFooter
          onConfirm={startSwapFlow}
          trade={trade}
          swapResult={swapResult}
          allowedSlippage={allowedSlippage}
          disabledConfirm={showAcceptChanges}
          swapQuoteReceivedDate={swapQuoteReceivedDate}
          fiatValueInput={fiatValueInput}
          fiatValueOutput={fiatValueOutput}
          showAcceptChanges={showAcceptChanges}
          onAcceptChanges={onAcceptChanges}
          swapErrorMessage={swapFailed ? swapError?.message : undefined}
          trustline={trustline}
          networkFees={networkFees}
        />
      );
    }
    return (
      <PendingModalContent
        hideStepIndicators={pendingModalSteps.length === 1}
        steps={pendingModalSteps}
        currentStep={confirmModalState}
        trade={trade}
        swapResult={swapResult}
        wrapTxHash={wrapTxHash}
        tokenApprovalPending={trustline}
      />
    );
  }, [
    trustline,
    allowedSlippage,
    confirmModalState,
    fiatValueInput,
    fiatValueOutput,
    onAcceptChanges,
    pendingModalSteps,
    showAcceptChanges,
    startSwapFlow,
    swapError?.message,
    swapFailed,
    swapQuoteReceivedDate,
    swapResult,
    trade,
    wrapTxHash,
    networkFees,
  ]);

  const titleToShow =
    confirmModalState === ConfirmModalState.REVIEWING ? 'Confirm Swap' : undefined;

  return (
    <Modal
      open={true}
      onClose={onDismiss}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div>
        <ConfirmationModalContent
          title={titleToShow}
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
          // headerContent={l2Badge}
        />
      </div>
    </Modal>
  );
}
