// import { Trans } from '@lingui/macro' //This is for localization and translation on all languages
import { styled } from '@mui/material/styles';
import { RowBetween, RowFixed } from '../Row'
import { SubHeader } from '../Text';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { InterfaceTrade } from 'state/routing/types';
import { TokenType } from 'interfaces';
import { Field } from 'state/swap/actions';
import { Modal } from '@mui/material';
import { ConfirmationModalContent } from 'components/TransactionConfirmationModal';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import SwapModalHeader from './SwapModalHeader';
import { PendingConfirmModalState, PendingModalContent } from './PendingModalContent';
import SwapModalFooter from './SwapModalFooter';
import { didUserReject } from 'utils/swapErrorToUserReadableMessage';
import { PendingModalError } from './PendingModalContent/ErrorModalContent';
import { AllowanceState } from 'hooks/usePermit2Allowance';

const StyledSwapHeader = styled(RowBetween)(({ theme }) => ({
  marginBottom: 10,
  color: theme.palette.secondary.main,
}));

const HeaderButtonContainer = styled(RowFixed)`
  padding: 0 12px;
  gap: 16px;
`

export enum ConfirmModalState {
  REVIEWING,
  WRAPPING,
  RESETTING_USDT,
  APPROVING_TOKEN,
  PERMITTING,
  PENDING_CONFIRMATION,
}

function useConfirmModalState({
  trade,
  allowedSlippage,
  onSwap,
  allowance,
  doesTradeDiffer,
  onCurrencySelection,
}: {
  trade: InterfaceTrade
  allowedSlippage: any//Percent
  onSwap: () => void
  allowance: any//Allowance
  doesTradeDiffer?: boolean
  onCurrencySelection: (field: Field, currency: TokenType) => void
}) {
  const [confirmModalState, setConfirmModalState] = useState<ConfirmModalState>(ConfirmModalState.REVIEWING)
  const [approvalError, setApprovalError] = useState<PendingModalError>()
  const [pendingModalSteps, setPendingModalSteps] = useState<PendingConfirmModalState[]>([])

  // This is a function instead of a memoized value because we do _not_ want it to update as the allowance changes.
  // For example, if the user needs to complete 3 steps initially, we should always show 3 step indicators
  // at the bottom of the modal, even after they complete steps 1 and 2.
  const generateRequiredSteps = useCallback(() => {
    const steps: PendingConfirmModalState[] = []
    // Any existing USDT allowance needs to be reset before we can approve the new amount (mainnet only).
    // See the `approve` function here: https://etherscan.io/address/0xdAC17F958D2ee523a2206206994597C13D831ec7#code
    if (
      allowance.state === AllowanceState.REQUIRED &&
      allowance.allowedAmount.greaterThan(0)
    ) {
      steps.push(ConfirmModalState.RESETTING_USDT)
    }
    if (allowance.state === AllowanceState.REQUIRED && allowance.needsSetupApproval) {
      steps.push(ConfirmModalState.APPROVING_TOKEN)
    }
    if (allowance.state === AllowanceState.REQUIRED && allowance.needsPermitSignature) {
      steps.push(ConfirmModalState.PERMITTING)
    }
    steps.push(ConfirmModalState.PENDING_CONFIRMATION)
    return steps
  }, [allowance])

  // const { chainId } = useWeb3React()
  // const trace = useTrace()
  // const maximumAmountIn = useMaxAmountIn(trade, allowedSlippage)

  // const nativeCurrency = useNativeCurrency(chainId)

  const [wrapTxHash, setWrapTxHash] = useState<string>()
  // const { execute: onWrap } = useWrapCallback(
  //   nativeCurrency,
  //   trade.inputAmount.currency,
  //   formatCurrencyAmount(trade.inputAmount, NumberType.SwapTradeAmount)
  // )
  // const wrapConfirmed = useIsTransactionConfirmed(wrapTxHash)
  // const prevWrapConfirmed = usePrevious(wrapConfirmed)
  const catchUserReject = async (e: any, errorType: PendingModalError) => {
    setConfirmModalState(ConfirmModalState.REVIEWING)
    // if (didUserReject(e)) return
    console.error(e)
    setApprovalError(errorType)
  }

  const performStep = useCallback(
    async (step: ConfirmModalState) => {
      switch (step) {
        case ConfirmModalState.WRAPPING:
          setConfirmModalState(ConfirmModalState.WRAPPING)
          break
        case ConfirmModalState.RESETTING_USDT:
          setConfirmModalState(ConfirmModalState.RESETTING_USDT)
          break
        case ConfirmModalState.APPROVING_TOKEN:
          setConfirmModalState(ConfirmModalState.APPROVING_TOKEN)
          break
        case ConfirmModalState.PERMITTING:
          setConfirmModalState(ConfirmModalState.PERMITTING)
          break
        case ConfirmModalState.PENDING_CONFIRMATION:
          setConfirmModalState(ConfirmModalState.PENDING_CONFIRMATION)
          try {
            onSwap()
          } catch (e) {
            catchUserReject(e, PendingModalError.CONFIRMATION_ERROR)
          }
          break
        default:
          setConfirmModalState(ConfirmModalState.REVIEWING)
          break
      }
    },
    [onSwap]
  )

  const startSwapFlow = useCallback(() => {
    const steps = generateRequiredSteps()
    console.log("🚀 « steps:", steps)
    setPendingModalSteps(steps)
    performStep(steps[0])
  }, [generateRequiredSteps, performStep])

  // const previousSetupApprovalNeeded = usePrevious(
  //   allowance.state === AllowanceState.REQUIRED ? allowance.needsSetupApproval : undefined
  // )

  // useEffect(() => {
  //   // If the wrapping step finished, trigger the next step (allowance or swap).
  //   if (wrapConfirmed && !prevWrapConfirmed) {
  //     // moves on to either approve WETH or to swap submission
  //     performStep(pendingModalSteps[1])
  //   }
  // }, [pendingModalSteps, performStep, prevWrapConfirmed, wrapConfirmed])

  // useEffect(() => {
  //   if (
  //     allowance.state === AllowanceState.REQUIRED &&
  //     allowance.needsPermitSignature &&
  //     // If the token approval switched from missing to fulfilled, trigger the next step (permit2 signature).
  //     !allowance.needsSetupApproval &&
  //     previousSetupApprovalNeeded
  //   ) {
  //     performStep(ConfirmModalState.PERMITTING)
  //   }
  // }, [allowance, performStep, previousSetupApprovalNeeded])

  // const previousRevocationPending = usePrevious(
  //   allowance.state === AllowanceState.REQUIRED && allowance.isRevocationPending
  // )
  // useEffect(() => {
  //   if (allowance.state === AllowanceState.REQUIRED && previousRevocationPending && !allowance.isRevocationPending) {
  //     performStep(ConfirmModalState.APPROVING_TOKEN)
  //   }
  // }, [allowance, performStep, previousRevocationPending])

  // useEffect(() => {
  //   // Automatically triggers the next phase if the local modal state still thinks we're in the approval phase,
  //   // but the allowance has been set. This will automaticaly trigger the swap.
  //   if (isInApprovalPhase(confirmModalState) && allowance.state === AllowanceState.ALLOWED) {
  //     // Caveat: prevents swap if trade has updated mid approval flow.
  //     if (doesTradeDiffer) {
  //       setConfirmModalState(ConfirmModalState.REVIEWING)
  //       return
  //     }
  //     performStep(ConfirmModalState.PENDING_CONFIRMATION)
  //   }
  // }, [allowance, confirmModalState, doesTradeDiffer, performStep])

  const onCancel = () => {
    setConfirmModalState(ConfirmModalState.REVIEWING)
    setApprovalError(undefined)
  }

  return { startSwapFlow, onCancel, confirmModalState, approvalError, pendingModalSteps, wrapTxHash }
}

export default function ConfirmSwapModal({
  trade,
  inputCurrency,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  allowance,
  onConfirm,
  onDismiss,
  onCurrencySelection,
  swapError,
  swapResult,
  swapQuoteReceivedDate,
  fiatValueInput,
  fiatValueOutput,
}: {
  trade: InterfaceTrade
  inputCurrency?: TokenType
  originalTrade?: InterfaceTrade
  swapResult?: any//SwapResult
  allowedSlippage: any//Percent
  allowance: any//Allowance
  onAcceptChanges: () => void
  onConfirm: () => void
  swapError?: Error
  onDismiss: () => void
  onCurrencySelection: (field: Field, currency: TokenType) => void
  swapQuoteReceivedDate?: Date
  fiatValueInput: { data?: number; isLoading: boolean }
  fiatValueOutput: { data?: number; isLoading: boolean }
  }) {
  const { startSwapFlow, onCancel, confirmModalState, approvalError, pendingModalSteps, wrapTxHash } = 
    useConfirmModalState({
      trade,
      allowedSlippage,
      onSwap: onConfirm,
      onCurrencySelection,
      allowance,
    })
  
  const swapFailed = Boolean(swapError) // && !didUserReject(swapError)

  // const showAcceptChanges = Boolean(
  //   trade && confirmModalState !== ConfirmModalState.PENDING_CONFIRMATION
  // )
  const showAcceptChanges = false
  const modalHeader = useCallback(() => {
    if (confirmModalState !== ConfirmModalState.REVIEWING && !showAcceptChanges) {
      return null
    }
    return <SwapModalHeader inputCurrency={inputCurrency} trade={trade} allowedSlippage={allowedSlippage} />
  }, [allowedSlippage, confirmModalState, showAcceptChanges, trade, inputCurrency])

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
        />
      )
    }
    return (
      <PendingModalContent
        hideStepIndicators={pendingModalSteps.length === 1}
        steps={pendingModalSteps}
        currentStep={confirmModalState}
        trade={trade}
        swapResult={swapResult}
        wrapTxHash={wrapTxHash}
        tokenApprovalPending={allowance.state === AllowanceState.REQUIRED && allowance.isApprovalPending}
        revocationPending={allowance.state === AllowanceState.REQUIRED && allowance.isRevocationPending}
      />
    )
  }, [allowance.isApprovalPending, allowance.isRevocationPending, allowance.state, allowedSlippage, confirmModalState, fiatValueInput, fiatValueOutput, onAcceptChanges, pendingModalSteps, showAcceptChanges, startSwapFlow, swapError?.message, swapFailed, swapQuoteReceivedDate, swapResult, trade, wrapTxHash])


  return (
    <Modal
      open={true}
      onClose={onDismiss}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <ConfirmationModalContent
        title={confirmModalState === ConfirmModalState.REVIEWING ? "Review swap" : undefined}
        onDismiss={onDismiss}
        topContent={modalHeader}
        bottomContent={modalBottom}
        // headerContent={l2Badge}
      /> 
    </Modal>
  )
}
