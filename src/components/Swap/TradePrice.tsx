import { styled } from '@mui/material';
import { useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { BodySmall } from 'components/Text';
import { getExpectedAmountNew } from 'functions/getExpectedAmount';
import { formatTokenAmount } from 'helpers/format';
import useGetReservesByPair from 'hooks/useGetReservesByPair';
import { useCallback, useEffect, useState } from 'react';
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

export default function TradePrice({ trade }: TradePriceProps) {
  const [showInverted, setShowInverted] = useState<boolean>(true);
  const [expectedAmountOfOne, setExpectedAmountOfOne] = useState<string | number>('0');

  const label = showInverted
    ? trade?.inputAmount?.currency.symbol
    : trade?.outputAmount?.currency.symbol;

  const mainCurrency = showInverted ? trade?.outputAmount?.currency : trade?.inputAmount?.currency;
  const otherCurrency = showInverted ? trade?.inputAmount?.currency : trade?.outputAmount?.currency;

  const flipPrice = useCallback(
    () => setShowInverted(!showInverted),
    [setShowInverted, showInverted],
  );

  const { reserves } = useGetReservesByPair({
    baseAddress: mainCurrency?.address,
    otherAddress: otherCurrency?.address,
  });

  useEffect(() => {
    if (reserves && mainCurrency && otherCurrency) {
      getExpectedAmountNew(mainCurrency, otherCurrency, BigNumber(1).shiftedBy(7), reserves).then(
        (resp) => {
          setExpectedAmountOfOne(formatTokenAmount(resp));
        },
      );
    }
  }, [reserves, mainCurrency, otherCurrency]);

  const text = `${'1 ' + label + ' = ' + expectedAmountOfOne ?? '-'} ${mainCurrency?.symbol}`;

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
