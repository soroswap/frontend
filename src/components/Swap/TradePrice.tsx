import { styled } from "@mui/material"
import { useSorobanReact } from "@soroban-react/core"
import BigNumber from "bignumber.js"
import { BodySmall } from "components/Text"
import fromExactInputGetExpectedOutput from "functions/fromExactInputGetExpectedOutput"
import { getExpectedAmount } from "functions/getExpectedAmount"
import { formatTokenAmount } from "helpers/format"
import { useStellarUSD } from "hooks/useUSDPrice"
import React, { useCallback, useMemo, useState } from "react"
import { AlertCircle } from "react-feather"
import { InterfaceTrade } from "state/routing/types"

interface TradePriceProps {
  trade: InterfaceTrade
}

const StyledPriceContainer = styled('button')`
  background-color: transparent;
  border: none;
  cursor: pointer;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  grid-template-columns: 1fr auto;
  grid-gap: 0.25rem;
  display: flex;
  flex-direction: row;
  text-align: left;
  flex-wrap: wrap;
  user-select: text;
`

export default function TradePrice({ trade }: TradePriceProps) {
  const sorobanContext = useSorobanReact()
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const [expectedAmountOfOne, setExpectedAmountOfOne] = useState<string | number>()

  const label = showInverted ? `${trade.outputAmount.currency.symbol}` : `${trade.inputAmount.currency.symbol} `
  const mainCurrency = showInverted ? trade.inputAmount.currency : trade.outputAmount.currency
  const otherCurrency = !showInverted ? trade.inputAmount.currency : trade.outputAmount.currency
  const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted])

  const formattedPrice = useMemo(() => {
    try {
      getExpectedAmount(mainCurrency, otherCurrency, BigNumber(1).shiftedBy(7), sorobanContext).then((resp) => {
        setExpectedAmountOfOne(formatTokenAmount(resp))
      })
      return expectedAmountOfOne
    } catch {
      return '0'
    }
  }, [expectedAmountOfOne, mainCurrency, otherCurrency, sorobanContext])

  const text = `${'1 ' + mainCurrency.symbol + ' = ' + formattedPrice ?? '-'} ${label}`

  return (
    <StyledPriceContainer
      onClick={(e) => {
        e.stopPropagation() // dont want this click to affect dropdowns / hovers
        flipPrice()
      }}
      title={text}
    >
      <AlertCircle width={16} height={16}/>
      <BodySmall>{text}</BodySmall>{' '}
    </StyledPriceContainer>
  )
}
