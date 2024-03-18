import { getPairAddress } from 'functions/getPairAddress';
import { InterfaceTrade } from 'state/routing/types';
import { reservesBNWithTokens } from './useReserves';
import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import useSWRImmutable from 'swr/immutable';

const expectedAmount = (reserve0: BigNumber, reserve1: BigNumber, amount: BigNumber) => {
  let amountInWithFee = amount.multipliedBy(997);
  let numerator = amountInWithFee.multipliedBy(reserve1);
  let denominator = reserve0.multipliedBy(1000).plus(amountInWithFee);
  return numerator.dividedBy(denominator);
};

const getCurrentAndAfterAmount = async (
  amount: BigNumber,
  amountAfter: BigNumber,
  token0: string,
  token1: string,
  sorobanContext: SorobanContextType,
) => {
  const pair = await getPairAddress(token0, token1, sorobanContext);

  if (!pair) return null;

  const reserves = await reservesBNWithTokens(pair, sorobanContext);

  const isToken0 = token1 === reserves.token0;

  const reserve0 = isToken0 ? reserves.reserve0 : reserves.reserve1;
  const reserve1 = isToken0 ? reserves.reserve1 : reserves.reserve0;

  if (!reserve0 || !reserve1) return null;

  const expectedCurrent = expectedAmount(reserve0, reserve1, BigNumber(amount));

  const reserve0After = reserve0.plus(expectedCurrent);
  const reserve1After = reserve1.minus(expectedCurrent);

  const expectedAfter = expectedAmount(reserve0After, reserve1After, amountAfter);

  return { expectedCurrent, expectedAfter };
};

//Calculate price impact from path of 2 or 3 addresses
//We use maxHops = 2 in the soroswap-router-sdk so we only need to calculate for path of 2 or 3
const getPriceImpactWithPath = async (
  amountIn: string | number | undefined,
  path: string[] | undefined,
  sorobanContext: SorobanContextType,
) => {
  if (!path || path.length === 0) return '0';
  if (!amountIn) return '0';

  const amountBN = BigNumber(amountIn);

  const token0 = path[0];
  const token1 = path[1];

  const firstPathAmounts = await getCurrentAndAfterAmount(
    amountBN,
    amountBN,
    token0,
    token1,
    sorobanContext,
  );

  if (!firstPathAmounts) return '0';

  if (path.length === 2) {
    const price0 = firstPathAmounts.expectedCurrent.dividedBy(amountBN);
    const price1 = firstPathAmounts.expectedAfter.dividedBy(amountBN);

    return price0.minus(price1).dividedBy(price0).toString();
  } else {
    const token2 = path[2];

    const secondPathAmounts = await getCurrentAndAfterAmount(
      firstPathAmounts.expectedCurrent,
      firstPathAmounts.expectedAfter,
      token1,
      token2,
      sorobanContext,
    );

    if (!secondPathAmounts) return '0';

    const price0 = secondPathAmounts.expectedCurrent.dividedBy(amountBN);
    const price1 = secondPathAmounts.expectedAfter.dividedBy(amountBN);

    return price0.minus(price1).dividedBy(price0).toString();
  }
};

const useGetPriceImpactFromTrade = (trade: InterfaceTrade | null | undefined) => {
  const sorobanContext = useSorobanReact();

  const shouldFetch =
    trade && trade.inputAmount && trade.path && trade.path.length > 0 && sorobanContext;

  const { data, isLoading, error } = useSWRImmutable(
    shouldFetch ? ['price-impact', trade, sorobanContext] : null,
    ([key, trade, sorobanContext]) =>
      getPriceImpactWithPath(trade?.inputAmount?.value, trade?.path, sorobanContext),
  );

  const formatted = useMemo(() => {
    if (data) {
      const number = Number(data) * 100;
      const isVerySmall = number < 0.01;
      return isVerySmall ? '<0.01' : number.toFixed(2);
    }
    return 0;
  }, [data]);

  return { data, isLoading, isError: error, formatted };
};

export default useGetPriceImpactFromTrade;
