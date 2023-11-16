import { styled } from '@mui/material';
import { BodySmall } from 'components/Text';
import { useCallback, useState } from 'react';
import { AlertCircle } from 'react-feather';
import { InterfaceTrade } from 'state/routing/types';

interface TradePriceProps {
  trade: InterfaceTrade;
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
`;

export const getExpectedAmountOfOne = (trade: InterfaceTrade, showInverted: boolean) => {
  const { inputAmount, outputAmount } = trade;

  if (!inputAmount || !outputAmount) return;

  const inputValue = Number(inputAmount?.value);
  const outputValue = Number(outputAmount?.value);

  const expectedAmountOfOne = showInverted ? outputValue / inputValue : inputValue / outputValue;
  return expectedAmountOfOne.toFixed(6);
};

export default function TradePrice({ trade }: TradePriceProps) {
  const [showInverted, setShowInverted] = useState<boolean>(true);

  const mainCurrency = showInverted ? trade?.outputAmount?.currency : trade?.inputAmount?.currency;
  const otherCurrency = showInverted ? trade?.inputAmount?.currency : trade?.outputAmount?.currency;

  const flipPrice = useCallback(
    () => setShowInverted(!showInverted),
    [setShowInverted, showInverted],
  );

  const text = `${
    '1 ' + otherCurrency?.symbol + ' = ' + getExpectedAmountOfOne(trade, showInverted) ?? '-'
  } ${mainCurrency?.symbol}`;

  return (
    <StyledPriceContainer
      onClick={(e) => {
        e.stopPropagation(); // dont want this click to affect dropdowns / hovers
        flipPrice();
      }}
      title={text}
    >
      <AlertCircle width={16} height={16} />
      <BodySmall>{text}</BodySmall>{' '}
    </StyledPriceContainer>
  );
}
