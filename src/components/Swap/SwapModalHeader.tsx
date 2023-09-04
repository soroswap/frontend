// import { Trans } from '@lingui/macro'
// import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
// import Column, { AutoColumn } from 'components/Column'
// import { useUSDPrice } from 'hooks/useUSDPrice'
// import { InterfaceTrade } from 'state/routing/types'
// import { Field } from 'state/swap/actions'
// import { Divider, ThemedText } from 'theme'

import { Divider, styled } from "@mui/material"
import Column, { AutoColumn } from "components/Column"
import { TokenType } from "interfaces"
import { InterfaceTrade, TradeType } from "state/routing/types"
import { SwapModalHeaderAmount } from "./SwapModalHeaderAmount"
import { Field } from "state/swap/actions"
import { Caption } from "components/Text"

// import { SwapModalHeaderAmount } from './SwapModalHeaderAmount'

const Rule = styled(Divider)`
  margin: 16px 2px 24px 2px;
`

const HeaderContainer = styled(AutoColumn)`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
`

export default function SwapModalHeader({
  trade,
  inputCurrency,
  allowedSlippage,
}: {
  trade: InterfaceTrade
  inputCurrency?: TokenType
  allowedSlippage: any
}) {
  console.log("🚀 « trade:", trade)
  const fiatValueInput = 0//useUSDPrice(trade.inputAmount) TODO: Get USD Value
  const fiatValueOutput = 0//useUSDPrice(trade.outputAmount)

  return (
    <HeaderContainer gap="8px">
      <Column gap="24px">
        <SwapModalHeaderAmount
          field={Field.INPUT}
          label={"You sell"}
          amount={trade.inputAmount.value}
          currency={inputCurrency}
          usdAmount={fiatValueInput}
        />
        <SwapModalHeaderAmount
          field={Field.OUTPUT}
          label="You receive"
          amount={trade.outputAmount.value}
          currency={trade.outputAmount.currency}
          usdAmount={fiatValueOutput}
          tooltipText={
            trade.tradeType === TradeType.EXACT_INPUT ? (
              <Caption>
                <>
                  Output is estimated. You will receive at least{' '}
                  <b>
                    1{/* {trade.minimumAmountOut(allowedSlippage).toSignificant(6)} {trade.outputAmount.currency.symbol} */}
                  </b>{' '}
                  or the transaction will revert.
                </>
              </Caption>
            ) : (
              <Caption>
                <>
                  Input is estimated. You will sell at most{' '}
                  <b>
                    1{/* {trade.maximumAmountIn(allowedSlippage).toSignificant(6)} {trade.inputAmount.currency.symbol} */}
                  </b>{' '}
                  or the transaction will revert.
                </>
              </Caption>
            )
          }
        />
      </Column>
      <Rule />
    </HeaderContainer>
  )
}
