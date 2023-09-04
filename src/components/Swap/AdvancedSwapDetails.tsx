import Column from "components/Column"
import { LoadingRows } from "components/Loader/styled"
import { RowBetween, RowFixed } from "components/Row"
import { Separator } from "components/SearchModal/styleds"
import { BodySmall } from "components/Text"
import { MouseoverTooltip } from "components/Tooltip"
import { InterfaceTrade } from "state/routing/types"

interface AdvancedSwapDetailsProps {
  trade: InterfaceTrade | undefined
  allowedSlippage: number
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
  // const { chainId } = useWeb3React()
  // const nativeCurrency = useNativeCurrency(chainId)
  // const txCount = getTransactionCount(trade)

  const supportsGasEstimate = false//chainId && SUPPORTED_GAS_ESTIMATE_CHAIN_IDS.includes(chainId)

  return (
    <Column gap="md">
      <Separator />
      {supportsGasEstimate && (
        <RowBetween>
          <MouseoverTooltip
            title={"The fee paid to miners who process your transaction. This must be paid in XLM."}
          >
            <BodySmall color="textSecondary">
              Network fee
            </BodySmall>
          </MouseoverTooltip>
          <MouseoverTooltip
            placement="right"
            title={""}//<GasBreakdownTooltip trade={trade} hideUniswapXDescription />}
          >
            <TextWithLoadingPlaceholder syncing={syncing} width={50}>
              <BodySmall>
                ASD
                {/* {`${trade.totalGasUseEstimateUSD ? '~' : ''}${formatNumber(
                  trade.totalGasUseEstimateUSD,
                  NumberType.FiatGasPrice
                )}`} */}
              </BodySmall>
            </TextWithLoadingPlaceholder>
          </MouseoverTooltip>
        </RowBetween>
      )}
      {false && (
        <RowBetween>
          <MouseoverTooltip title={"The impact your trade has on the market price of this pool."}>
            <BodySmall color="textSecondary">
              Price Impact
            </BodySmall>
          </MouseoverTooltip>
          <TextWithLoadingPlaceholder syncing={syncing} width={50}>
            <BodySmall>ss</BodySmall>
          </TextWithLoadingPlaceholder>
        </RowBetween>
      )}
      <RowBetween>
        <RowFixed>
          <MouseoverTooltip
            title={"The minimum amount you are guaranteed to receive. If the price slips any further, your transaction will revert."}
          >
            <BodySmall color="textSecondary">
              gg
              {/* {trade.tradeType === TradeType.EXACT_INPUT ? "Minimum output" : "Maximum input"} */}
            </BodySmall>
          </MouseoverTooltip>
        </RowFixed>
        <TextWithLoadingPlaceholder syncing={syncing} width={70}>
          <BodySmall>
            ASD
            {/* {trade.tradeType === TradeType.EXACT_INPUT
              ? `${formatCurrencyAmount(trade.minimumAmountOut(allowedSlippage), NumberType.SwapTradeAmount)} ${
                  trade.outputAmount.currency.symbol
                }`
              : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol}`} */}
          </BodySmall>
        </TextWithLoadingPlaceholder>
      </RowBetween>
      <RowBetween>
        <RowFixed>
          <MouseoverTooltip
            title={`
                The amount you expect to receive at the current market price. You may receive less or more if the market
                price changes while your transaction is pending.
              `
            }
          >
            <BodySmall color="textSecondary">
              Expected output
            </BodySmall>
          </MouseoverTooltip>
        </RowFixed>
        <TextWithLoadingPlaceholder syncing={syncing} width={65}>
          <BodySmall>
            SS
            {/* {`${formatCurrencyAmount(trade.outputAmount, NumberType.SwapTradeAmount)} ${
              trade.outputAmount.currency.symbol
            }`} */}
          </BodySmall>
        </TextWithLoadingPlaceholder>
      </RowBetween>
      <Separator />
      <RowBetween>
        <BodySmall color="textSecondary">
          Order routing
        </BodySmall>
        {false ? (
          <MouseoverTooltip
            title={"GG"}//<SwapRoute data-testid="swap-route-info" trade={trade} syncing={syncing} />}
          >
            <BodySmall>FF</BodySmall>{/* <RouterLabel trade={trade} /> */}
          </MouseoverTooltip>
        ) : (
          <MouseoverTooltip
            title={"DD"}//<GasBreakdownTooltip trade={trade} hideFees />}
            placement="right"
          >
            <BodySmall>FG</BodySmall>{/* <RouterLabel trade={trade} /> */}
          </MouseoverTooltip>
        )}
      </RowBetween>
    </Column>
  )
}
