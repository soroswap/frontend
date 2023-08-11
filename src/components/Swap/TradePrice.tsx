//import { useUSDPrice } from 'hooks/useUSDPrice'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useCallback, useMemo, useState } from 'react'
import { styled } from "@mui/material";
import { BodySmall } from 'components/Text'
import { Price } from 'interfaces';

interface TradePriceProps {
  price: Price
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

export default function TradePrice({ price }: TradePriceProps) {
  const [showInverted, setShowInverted] = useState<boolean>(false)

  const { baseCurrency, quoteCurrency } = price
  //const { data: usdPrice } = useUSDPrice(tryParseCurrencyAmount('1', showInverted ? baseCurrency : quoteCurrency))

  const formattedPrice = useMemo(() => {
    try {
      return price.price
    } catch {
      return '0'
    }
  }, [price, showInverted])

  const label = showInverted ? `${price.quoteCurrency?.token_symbol}` : `${price.baseCurrency?.token_symbol} `
  const labelInverted = showInverted ? `${price.baseCurrency?.token_symbol} ` : `${price.quoteCurrency?.token_symbol}`
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
      <BodySmall>{text}</BodySmall>{' '}
      {/* {usdPrice && (
        <BodySmall color="textSecondary">
          ({formatNumber(usdPrice, NumberType.FiatTokenPrice)})
        </BodySmall>
      )} */}
    </StyledPriceContainer>
  )
}
