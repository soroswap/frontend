// import { t, Trans } from '@lingui/macro'
// import { ChainId, Currency } from '@uniswap/sdk-core'
// import { useWeb3React } from '@web3-react/core'
// import { OrderContent } from 'components/AccountDrawer/MiniPortfolio/Activity/OffchainActivityModal'
// import { ColumnCenter } from 'components/Column'
// import Column from 'components/Column'
// import Row from 'components/Row'
// import { SwapResult } from 'hooks/useSwapCallback'
// import { useUnmountingAnimation } from 'hooks/useUnmountingAnimation'
// import { UniswapXOrderStatus } from 'lib/hooks/orders/types'
// import { ReactNode, useRef } from 'react'
// import { InterfaceTrade, TradeFillType } from 'state/routing/types'
// import { useOrder } from 'state/signatures/hooks'
// import { UniswapXOrderDetails } from 'state/signatures/types'
// import { useIsTransactionConfirmed } from 'state/transactions/hooks'
// import { ExternalLink } from 'theme'
// import { ThemedText } from 'theme/components/text'
// import { getExplorerLink } from 'utils/getExplorerLink'
// import { ExplorerDataType } from 'utils/getExplorerLink'

import { css, keyframes, styled, useTheme } from '@mui/material'
import { ConfirmModalState } from '../ConfirmSwapModal'
import {
  AnimatedEntranceConfirmationIcon,
  AnimationType,
  CurrencyLoader,
  LoadingIndicatorOverlay,
  LogoContainer,
  PaperIcon,
} from './Logos'
import { TradeSummary } from './TradeSummary'
import Column, { ColumnCenter } from 'components/Column'
import { ReactNode, useRef } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import { TokenType } from 'interfaces'
import { ExternalLink, Paperclip } from 'react-feather'
import Row from 'components/Row'
import { Caption, LabelSmall, SubHeaderLarge } from 'components/Text'
import Link from 'next/link'

export const PendingModalContainer = styled(ColumnCenter)`
  margin: 48px 0 8px;
`

const HeaderContainer = styled(ColumnCenter)<{ $disabled?: boolean }>`
  ${({ $disabled }) => $disabled && `opacity: 0.5;`}
  gap: 10px;
  overflow: visible;
`

const StepCircle = styled('div')<{ active: boolean }>`
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background-color: ${({ theme, active }) => (active ? theme.palette.customBackground.accentAction : theme.palette.custom.textTertiary)};
  outline: 3px solid ${({ theme, active }) => (active ? theme.palette.customBackground.accentActionSoft : theme.palette.custom.accentTextLightTertiary)};
  transition: background-color 250ms ease-in-out;
`

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(40px) }
  to { opacity: 1; transform: translateX(0px) }
`
const slideInAnimation = css`
  animation: from { opacity: 0; transform: translateX(40px) } to { opacity: 1; transform: translateX(0px) } 250ms ease-in-out;
`
const slideOut = keyframes`
  from { opacity: 1; transform: translateX(0px) }
  to { opacity: 0; transform: translateX(-40px) }
`
const slideOutAnimation = css`
  animation: from { opacity: 1; transform: translateX(0px) } to { opacity: 0; transform: translateX(-40px) } 250ms ease-in-out;
`

const AnimationWrapper = styled('div')`
  position: relative;
  width: 100%;
  min-height: 72px;
  display: flex;
  flex-grow: 1;
`

const CustomLink = styled(Link)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const StepTitleAnimationContainer = styled(Column)<{ disableEntranceAnimation?: boolean }>`
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
`

// This component is used for all steps after ConfirmModalState.REVIEWING
export type PendingConfirmModalState = Extract<
  ConfirmModalState,
  | ConfirmModalState.APPROVING_TOKEN
  | ConfirmModalState.PERMITTING
  | ConfirmModalState.PENDING_CONFIRMATION
  | ConfirmModalState.WRAPPING
  | ConfirmModalState.RESETTING_USDT
>

interface PendingModalStep {
  title: ReactNode
  subtitle?: ReactNode
  label?: ReactNode
  logo?: ReactNode
  button?: ReactNode
}

interface PendingModalContentProps {
  steps?: PendingConfirmModalState[]
  currentStep?: PendingConfirmModalState
  trade?: InterfaceTrade
  swapResult?: any//SwapResult
  wrapTxHash?: string
  hideStepIndicators?: boolean
  tokenApprovalPending?: boolean
  revocationPending?: boolean
}

interface ContentArgs {
  step: PendingConfirmModalState
  approvalCurrency?: TokenType
  trade?: InterfaceTrade
  swapConfirmed: boolean
  swapPending: boolean
  wrapPending: boolean
  tokenApprovalPending: boolean
  revocationPending: boolean
  swapResult?: any//SwapResult
  chainId?: number
  order?: any//UniswapXOrderDetails
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
  } = args
  
  console.log("🚀 « step:", step)
  
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
      }
    case ConfirmModalState.RESETTING_USDT:
      return {
        title: `Reset USDT`,
        subtitle: `USDT requires resetting approval when spending limits are too low.`,
        label: revocationPending ? `Pending...` : `Proceed in your wallet`,
      }
    case ConfirmModalState.APPROVING_TOKEN:
      return {
        title: `Enable spending ${approvalCurrency?.symbol ?? 'this token'} on Uniswap`,
        subtitle: (
          <CustomLink href="https://support.uniswap.org/hc/en-us/articles/8120520483085">
            Why is this required?
          </CustomLink>
        ),
        label: tokenApprovalPending ? `Pending...` : `Proceed in your wallet`,
      }
    case ConfirmModalState.PERMITTING:
      return {
        title: `Allow ${approvalCurrency?.symbol ?? 'this token'} to be used for swapping`,
        subtitle: (
          <CustomLink href="https://support.uniswap.org/hc/en-us/articles/8120520483085" target='_blank'>
            Why is this required?
          </CustomLink>
        ),
        label: `Proceed in your wallet`,
      }
    case ConfirmModalState.PENDING_CONFIRMATION: {
      let labelText: string | null = null
      let href: string | null = null

      if (swapConfirmed && swapResult) {
        labelText = `View on Explorer`
        href = "https://google.com"//TODO: getExplorerLink(chainId, swapResult.response.hash, ExplorerDataType.TRANSACTION)
      } else if (swapPending) {
        labelText = `Proceed in your wallet`
      }
      
      return {
        title: swapPending ? `Swap submitted` : swapConfirmed ? `Success` : `Waiting for confirmation`,
        subtitle: trade ? <TradeSummary trade={trade} /> : null,
        label: href ? (
          <CustomLink href={href} target='_blank'>
            {labelText}
          </CustomLink>
        ) : (
          labelText
        ),
      }
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
  // // TODO(UniswapX): Support UniswapX status here too
  // const uniswapXSwapConfirmed = Boolean(swapResult)

  const swapConfirmed = swapResult ? true : false

  const swapPending = !swapResult ? true : false
  const wrapPending = false//wrapTxHash != undefined && !wrapConfirmed

  const { label, button } = getContent({
    step: currentStep,
    approvalCurrency: trade?.inputAmount.currency,
    swapConfirmed,
    swapPending,
    wrapPending,
    tokenApprovalPending,
    revocationPending,
    swapResult,
    trade,
  })
  console.log("🚀 « label:", label)
  const theme = useTheme()

  // const order = useOrder(swapResult?.type === TradeFillType.UniswapX ? swapResult.response.orderHash : '')

  const currentStepContainerRef = useRef<HTMLDivElement>(null)
  // useUnmountingAnimation(currentStepContainerRef, () => AnimationType.EXITING)

  // if (steps.length === 0) {
  //   return null
  // }

  // // Return finalized-order-specifc content if available
  // if (order && order.status !== UniswapXOrderStatus.OPEN) {
  //   return <OrderContent order={{ status: order.status, orderHash: order.orderHash, details: order }} />
  // }

  // // On mainnet, we show the success icon once the tx is sent, since it takes longer to confirm than on L2s.
  const showSuccess = swapConfirmed || (!swapPending)

  return (
    <PendingModalContainer gap="24px">
      <LogoContainer>
        {currentStep === ConfirmModalState.APPROVING_TOKEN && <>dd</>}
        {currentStep !== ConfirmModalState.PENDING_CONFIRMATION && (
          <CurrencyLoader
            currency={trade?.inputAmount.currency}
            asBadge={currentStep === ConfirmModalState.APPROVING_TOKEN}
          />
        )}
        {currentStep === ConfirmModalState.PENDING_CONFIRMATION && showSuccess && <AnimatedEntranceConfirmationIcon />}
        {((currentStep === ConfirmModalState.PENDING_CONFIRMATION && !showSuccess) ||
          tokenApprovalPending ||
          wrapPending ||
          revocationPending) && <LoadingIndicatorOverlay />}
      </LogoContainer>
      <HeaderContainer
        $disabled={revocationPending || tokenApprovalPending || wrapPending || (!swapPending && !showSuccess)}
      >
        <AnimationWrapper>
          {steps?.map((step) => {
            const { title, subtitle } = getContent({
              step,
              approvalCurrency: trade?.inputAmount.currency,
              swapConfirmed,
              swapPending,
              wrapPending,
              revocationPending,
              tokenApprovalPending,
              swapResult,
              trade,
            })
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
                  <SubHeaderLarge textAlign="center" data-testid="pending-modal-content-title">
                    {title}
                  </SubHeaderLarge>
                  <LabelSmall style={{width: "100%"}} textAlign="center">{subtitle}</LabelSmall>
                </StepTitleAnimationContainer>
              )
            )
          })}
        </AnimationWrapper>
        <div style={{
          fontSize: 14,
          fontFamily: "Inter",
          color: theme.palette.custom.accentTextLightSecondary
        }} color={theme.palette.custom.accentTextLightPrimary}>
          {label}
        </div>
      </HeaderContainer>
      {button && <Row justify="center">{button}</Row>}
      {!hideStepIndicators && !showSuccess && (
        <Row gap="14px" justify="center">
          {steps?.map((_, i) => {
            return <StepCircle key={i} active={steps.indexOf(currentStep) === i} />
          })}
        </Row>
      )}
    </PendingModalContainer>
  )
}
