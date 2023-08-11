//import { formatCurrencyAmount, formatNumber, formatPriceImpact, NumberType } from '@uniswap/conedison/format'
import { Percent, TradeType } from '@uniswap/sdk-core'
import { LoadingRows } from 'components/Loader/styled'
//import { SUPPORTED_GAS_ESTIMATE_CHAIN_IDS } from 'constants/chains'
//import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { InterfaceTrade } from 'state/routing/types'
//import { getTransactionCount, isClassicTrade } from 'state/routing/utils'

import Column from '../Column'
//import RouterLabel from '../RouterLabel'
import { RowBetween, RowFixed } from '../Row'
import { MouseoverTooltip, TooltipSize } from '../Tooltip'
//import { GasBreakdownTooltip } from './GasBreakdownTooltip'
//import SwapRoute from './SwapRoute'
import { BodySmall } from 'components/Text'
import { Separator } from 'components/SearchModal/styleds'

interface AdvancedSwapDetailsProps {
  trade: InterfaceTrade
  allowedSlippage: Percent
  syncing?: boolean
}

function TextWithLoadingPlaceholder({
  syncing,
  width,
  children,
}: {
  syncing: boolean
  width: number
  children: JSX.Element
}) {
  return syncing ? (
    <LoadingRows data-testid="loading-rows">
      <div style={{ height: '15px', width: `${width}px` }} />
    </LoadingRows>
  ) : (
    children
  )
}

export function AdvancedSwapDetails({ trade, allowedSlippage, syncing = false }: AdvancedSwapDetailsProps) {
  //const txCount = getTransactionCount(trade)

  const supportsGasEstimate = false //chainId && SUPPORTED_GAS_ESTIMATE_CHAIN_IDS.includes(chainId)

  return (
    <Column gap="md">
      <Separator />
      {supportsGasEstimate && (
        <RowBetween>
          <MouseoverTooltip
            title={
              <span>
                The fee paid to miners who process your transaction. This must be paid in {nativeCurrency.symbol}.
              </span>
            }
          >
            <BodySmall color="textSecondary">
              {/* <Plural value={txCount} one="Network fee" other="Network fees" /> */}
            </BodySmall>
          </MouseoverTooltip>
          <MouseoverTooltip
            placement="right"
            title={<GasBreakdownTooltip trade={trade} hideUniswapXDescription />}
          >
            <TextWithLoadingPlaceholder syncing={syncing} width={50}>
              <BodySmall>
                {`${trade.totalGasUseEstimateUSD ? '~' : ''}${formatNumber(
                  trade.totalGasUseEstimateUSD,
                  NumberType.FiatGasPrice
                )}`}
              </BodySmall>
            </TextWithLoadingPlaceholder>
          </MouseoverTooltip>
        </RowBetween>
      )}
      {isClassicTrade(trade) && (
        <RowBetween>
          <MouseoverTooltip title={<span>The impact your trade has on the market price of this pool.</span>}>
            <BodySmall color="textSecondary">
              Price Impact
            </BodySmall>
          </MouseoverTooltip>
          <TextWithLoadingPlaceholder syncing={syncing} width={50}>
            <BodySmall>{formatPriceImpact(trade.priceImpact)}</BodySmall>
          </TextWithLoadingPlaceholder>
        </RowBetween>
      )}
      <RowBetween>
        <RowFixed>
          <MouseoverTooltip
            title={
              <span>
                The minimum amount you are guaranteed to receive. If the price slips any further, your transaction will
                revert.
              </span>
            }
          >
            <BodySmall color="textSecondary">
              {trade.tradeType === TradeType.EXACT_INPUT ? <span>Minimum output</span> : <span>Maximum input</span>}
            </BodySmall>
          </MouseoverTooltip>
        </RowFixed>
        <TextWithLoadingPlaceholder syncing={syncing} width={70}>
          <BodySmall>
            {trade.tradeType === TradeType.EXACT_INPUT
              ? `${formatCurrencyAmount(trade.minimumAmountOut(allowedSlippage), NumberType.SwapTradeAmount)} ${
                  trade.outputAmount.currency.symbol
                }`
              : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol}`}
          </BodySmall>
        </TextWithLoadingPlaceholder>
      </RowBetween>
      <RowBetween>
        <RowFixed>
          <MouseoverTooltip
            title={
              <span>
                The amount you expect to receive at the current market price. You may receive less or more if the market
                price changes while your transaction is pending.
              </span>
            }
          >
            <BodySmall color="textSecondary">
              Expected output
            </BodySmall>
          </MouseoverTooltip>
        </RowFixed>
        <TextWithLoadingPlaceholder syncing={syncing} width={65}>
          <BodySmall>
            {`${formatCurrencyAmount(trade.outputAmount, NumberType.SwapTradeAmount)} ${
              trade.outputAmount.currency.symbol
            }`}
          </BodySmall>
        </TextWithLoadingPlaceholder>
      </RowBetween>
      <Separator />
      <RowBetween>
        <BodySmall color="textSecondary">
          Order routing
        </BodySmall>
        {isClassicTrade(trade) ? (
          <MouseoverTooltip
          title={<SwapRoute data-testid="swap-route-info" trade={trade} syncing={syncing} />}
            onOpen={() => {
              sendAnalyticsEvent(SwapEventName.SWAP_AUTOROUTER_VISUALIZATION_EXPANDED, {
                element: InterfaceElementName.AUTOROUTER_VISUALIZATION_ROW,
              })
            }}
          >
            <RouterLabel trade={trade} />
          </MouseoverTooltip>
        ) : (
          <MouseoverTooltip
          title={<GasBreakdownTooltip trade={trade} hideFees />}
            placement="right"
            onOpen={() => {
              sendAnalyticsEvent(SwapEventName.SWAP_AUTOROUTER_VISUALIZATION_EXPANDED, {
                element: InterfaceElementName.AUTOROUTER_VISUALIZATION_ROW,
              })
            }}
          >
            <RouterLabel trade={trade} />
          </MouseoverTooltip>
        )}
      </RowBetween>
    </Column>
  )
}
