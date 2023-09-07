import { styled } from "@mui/material"
import { BodySmall } from "components/Text"
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
  const [showInverted, setShowInverted] = useState<boolean>(false)

  const formattedPrice = useMemo(() => {
    try {
      return trade.inputAmount ? trade.inputAmount.value : '0';
    } catch {
      return '0';
    }
  }, [trade])

  const label = showInverted ? `${trade.outputAmount ? trade.outputAmount.currency.symbol : ''}` : `${trade.inputAmount ? trade.inputAmount.currency.symbol : ''}`;
  const labelInverted = showInverted ? `${trade.inputAmount ? trade.inputAmount.currency.symbol : ''} ` : `${trade.outputAmount ? trade.outputAmount.currency.symbol : ''}`;
  const flipPrice = useCallback(() => setShowInverted(!showInverted), [setShowInverted, showInverted])

  const text = `${'1 ' + labelInverted + ' = ' + formattedPrice ?? '-'} ${label}`

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
