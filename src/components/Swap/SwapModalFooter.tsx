// import { Plural, Trans } from '@lingui/macro'
// import { TraceEvent } from '@uniswap/analytics'
// import { BrowserEvent, InterfaceElementName, SwapEventName } from '@uniswap/analytics-events'
// import { formatNumber, formatPriceImpact, NumberType } from '@uniswap/conedison/format'
// import { Percent, TradeType } from '@uniswap/sdk-core'
// import { useWeb3React } from '@web3-react/core'
// import Column from 'components/Column'
// import { MouseoverTooltip, TooltipSize } from 'components/Tooltip'
// import { SwapResult } from 'hooks/useSwapCallback'
// import useTransactionDeadline from 'hooks/useTransactionDeadline'
// import useNativeCurrency from 'lib/hooks/useNativeCurrency'
// import { ReactNode } from 'react'
// import { AlertTriangle } from 'react-feather'
// import { RouterPreference } from 'state/routing/slice'
// import { InterfaceTrade } from 'state/routing/types'
// import { getTransactionCount, isClassicTrade } from 'state/routing/utils'
// import { useRouterPreference, useUserSlippageTolerance } from 'state/user/hooks'
// import { ThemedText } from 'theme'
// import { formatTransactionAmount, priceToPreciseFloat } from 'utils/formatNumbers'
// import getRoutingDiagramEntries from 'utils/getRoutingDiagramEntries'
// import { formatSwapButtonClickEventProperties } from 'utils/loggingFormatters'
// import { getPriceImpactWarning } from 'utils/prices'

import { styled, useTheme } from "@mui/material";
import { ButtonError, SmallButtonPrimary } from "components/Buttons/Button";
import Column from "components/Column";
import Row, { AutoRow, RowBetween, RowFixed } from "components/Row";
import { BodySmall, HeadlineSmall, SubHeaderSmall } from "components/Text";
import { ReactNode } from "react";
import { AlertTriangle } from "react-feather";
import { InterfaceTrade, TradeType } from "state/routing/types";
import { Label } from "./SwapModalHeaderAmount";
import { MouseoverTooltip } from "components/Tooltip";
import { Plural } from "@lingui/macro";
import { SwapCallbackError, SwapShowAcceptChanges } from "./styleds";

// import { ButtonError, SmallButtonPrimary } from '../Button'
// import Row, { AutoRow, RowBetween, RowFixed } from '../Row'
// import { GasBreakdownTooltip } from './GasBreakdownTooltip'
// import { SwapCallbackError, SwapShowAcceptChanges } from './styleds'
// import { Label } from './SwapModalHeaderAmount'

const DetailsContainer = styled(Column)`
  padding: 0 8px;
`;

const StyledAlertTriangle = styled(AlertTriangle)`
  margin-right: 8px;
  min-width: 24px;
`;

const ConfirmButton = styled(ButtonError)`
  height: 56px;
  margin-top: 10px;
`;

const DetailRowValue = styled(BodySmall)`
  text-align: right;
  overflow-wrap: break-word;
`;

export default function SwapModalFooter({
  trade,
  allowedSlippage,
  swapResult,
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
  swapQuoteReceivedDate,
  fiatValueInput,
  fiatValueOutput,
  showAcceptChanges,
  onAcceptChanges,
}: {
  trade: InterfaceTrade;
  swapResult?: any; //SwapResult
  allowedSlippage: any; //Percent
  onConfirm: () => void;
  swapErrorMessage?: ReactNode;
  disabledConfirm: boolean;
  swapQuoteReceivedDate?: Date;
  fiatValueInput: { data?: number; isLoading: boolean };
  fiatValueOutput: { data?: number; isLoading: boolean };
  showAcceptChanges: boolean;
  onAcceptChanges: () => void;
}) {
  // const transactionDeadlineSecondsSinceEpoch = useTransactionDeadline()?.toNumber() // in seconds since epoch
  // const isAutoSlippage = useUserSlippageTolerance()[0] === 'auto'
  // const [routerPreference] = useRouterPreference()
  // const routes = isClassicTrade(trade) ? getRoutingDiagramEntries(trade) : undefined
  const theme = useTheme();
  // const { chainId } = useWeb3React()
  // const nativeCurrency = useNativeCurrency(chainId)

  const label = trade.inputAmount ? trade.inputAmount.currency.symbol : "";
  const labelInverted = trade.outputAmount
    ? trade.outputAmount.currency.symbol
    : "";
  const formattedPrice = 0; //formatTransactionAmount(priceToPreciseFloat(trade.executionPrice))
  const txCount = 0; //getTransactionCount(trade)

  return (
    <>
      <DetailsContainer gap="md">
        <BodySmall>
          <Row align="flex-start" justify="space-between" gap="sm">
            <Label>Exchange rate</Label>
            <DetailRowValue>{`1 ${labelInverted} = ${
              formattedPrice ?? "-"
            } ${label}`}</DetailRowValue>
          </Row>
        </BodySmall>
        <BodySmall>
          <Row align="flex-start" justify="space-between" gap="sm">
            <MouseoverTooltip
              title={
                "The fee paid to miners who process your transaction. This must be paid in ${nativeCurrency.symbol}."
              }
            >
              <Label cursor="help">Network fees</Label>
            </MouseoverTooltip>
            <MouseoverTooltip
              placement="right"
              title={"<GasBreakdownTooltip trade={trade} />"}
            >
              <DetailRowValue>gas fees</DetailRowValue>
            </MouseoverTooltip>
          </Row>
        </BodySmall>
        {true && (
          <BodySmall>
            <Row align="flex-start" justify="space-between" gap="sm">
              <MouseoverTooltip title="The impact your trade has on the market price of this pool.">
                <Label cursor="help">Price impact</Label>
              </MouseoverTooltip>
              <DetailRowValue>{"-"}</DetailRowValue>
            </Row>
          </BodySmall>
        )}
        <BodySmall>
          <Row align="flex-start" justify="space-between" gap="sm">
            <MouseoverTooltip
              title={
                trade.tradeType === TradeType.EXACT_INPUT ? (
                  <>
                    The minimum amount you are guaranteed to receive. If the
                    price slips any further, your transaction will revert.
                  </>
                ) : (
                  <>
                    The maximum amount you are guaranteed to spend. If the price
                    slips any further, your transaction will revert.
                  </>
                )
              }
            >
              <Label cursor="help">
                {trade.tradeType === TradeType.EXACT_INPUT ? (
                  <>Minimum received</>
                ) : (
                  <>Maximum sent</>
                )}
              </Label>
            </MouseoverTooltip>
            <DetailRowValue>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? trade.outputAmount
                  ? `XX ${trade.outputAmount.currency.symbol}`
                  : ""
                : trade.inputAmount
                ? `XX ${trade.inputAmount.currency.symbol}`
                : ""}
            </DetailRowValue>
          </Row>
        </BodySmall>
      </DetailsContainer>
      {showAcceptChanges ? (
        <SwapShowAcceptChanges data-testid="show-accept-changes">
          <RowBetween>
            <RowFixed>
              <StyledAlertTriangle size={20} />
              <SubHeaderSmall
                color={theme.palette.customBackground.accentAction}
              >
                Price updated
              </SubHeaderSmall>
            </RowFixed>
            <SmallButtonPrimary onClick={onAcceptChanges}>
              Accept
            </SmallButtonPrimary>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : (
        <AutoRow>
          <ConfirmButton
            data-testid="confirm-swap-button"
            onClick={onConfirm}
            disabled={disabledConfirm}
            $borderRadius="20px"
            id={"CONFIRM_SWAP_BUTTON"}
          >
            <HeadlineSmall color={theme.palette.custom.accentTextLightPrimary}>
              Confirm swap
            </HeadlineSmall>
          </ConfirmButton>
          {swapErrorMessage ? (
            <SwapCallbackError error={swapErrorMessage} />
          ) : null}
        </AutoRow>
      )}
    </>
  );
}
