// import { Trans } from '@lingui/macro'
// import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
// import Column, { AutoColumn } from 'components/Column'
// import { useUSDPrice } from 'hooks/useUSDPrice'
// import { InterfaceTrade } from 'state/routing/types'
// import { Field } from 'state/swap/actions'
// import styled from 'styled-components/macro'
// import { Divider, ThemedText } from 'theme'

import { Divider, styled } from "@mui/material"
import Column, { AutoColumn } from "components/Column"
import { TokenType } from "interfaces"
import { InterfaceTrade } from "state/routing/types"
import { SwapModalHeaderAmount } from "./SwapModalHeaderAmount"
import { Field } from "state/swap/actions"

// import { SwapModalHeaderAmount } from './SwapModalHeaderAmount'

const Rule = styled(Divider)`
  margin: 16px 2px 24px 2px;
`

const HeaderContainer = styled(AutoColumn)`
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
  const fiatValueInput = 0//useUSDPrice(trade.inputAmount) TODO: Get USD Value
  const fiatValueOutput = 0//useUSDPrice(trade.outputAmount)

  return (
    <HeaderContainer gap="8px">
      <Column gap="24px">
        <SwapModalHeaderAmount
          field={Field.INPUT}
          label={"You pay"}
          amount={trade.inputAmount}
          currency={inputCurrency}
          usdAmount={fiatValueInput}
        />
        {/* <SwapModalHeaderAmount
          field={Field.OUTPUT}
          label={<Trans>You receive</Trans>}
          amount={trade.outputAmount}
          currency={trade.outputAmount.currency}
          usdAmount={fiatValueOutput.data}
          tooltipText={
            trade.tradeType === TradeType.EXACT_INPUT ? (
              <ThemedText.Caption>
                <Trans>
                  Output is estimated. You will receive at least{' '}
                  <b>
                    {trade.minimumAmountOut(allowedSlippage).toSignificant(6)} {trade.outputAmount.currency.symbol}
                  </b>{' '}
                  or the transaction will revert.
                </Trans>
              </ThemedText.Caption>
            ) : (
              <ThemedText.Caption>
                <Trans>
                  Input is estimated. You will sell at most{' '}
                  <b>
                    {trade.maximumAmountIn(allowedSlippage).toSignificant(6)} {trade.inputAmount.currency.symbol}
                  </b>{' '}
                  or the transaction will revert.
                </Trans>
              </ThemedText.Caption>
            )
          }
        /> */}
      </Column>
      <Rule />
    </HeaderContainer>
  )
}
