import { SorobanContextType } from 'soroban-react-stellar-wallets-kit';
import BigNumber from 'bignumber.js';
import { reservesBNWithTokens } from 'hooks/useReserves';
import { TokenType } from 'interfaces';
import { TradeType } from 'state/routing/types';
import { ReservesType, getExpectedAmount, getExpectedAmountNew } from './getExpectedAmount';
import { getPairAddress } from './getPairAddress';

export async function getPriceImpactNew(
  currencyIn: TokenType | undefined,
  currencyOut: TokenType | undefined,
  amountIn: BigNumber,
  sorobanContext: SorobanContextType,
  tradeType?: TradeType,
) {
  if (!currencyIn || !currencyOut) return '0';

  const pairAddress = await getPairAddress(currencyIn.contract, currencyOut.contract, sorobanContext);
  const reserves = await reservesBNWithTokens(pairAddress, sorobanContext);

  const isToken0 = currencyIn.contract === reserves.token0;

  const reserve0 = isToken0 ? reserves.reserve0 : reserves.reserve1;
  const reserve1 = isToken0 ? reserves.reserve1 : reserves.reserve0;

  if (reserve0 && reserve1) {
    const reserveInAfter = reserve0.plus(amountIn);
    const expectedAmount = await getExpectedAmount(
      currencyIn,
      currencyOut,
      amountIn,
      sorobanContext,
    );
    const reserveOutAfter = reserve1.minus(expectedAmount);

    const customReserves = {
      token0: currencyIn,
      token1: currencyOut,
      reserve0: reserveInAfter,
      reserve1: reserveOutAfter,
    };

    const expectedAmountAfter = await getExpectedAmount(
      currencyIn,
      currencyOut,
      amountIn,
      sorobanContext,
      tradeType,
      customReserves,
    );

    const price0 = expectedAmount.dividedBy(amountIn);
    const price1 = expectedAmountAfter.dividedBy(amountIn);

    return price0.minus(price1).dividedBy(price0);
  } else {
    return '0';
  }
}

export async function getPriceImpactNew2(
  currencyIn: TokenType | undefined,
  currencyOut: TokenType | undefined,
  amountIn: BigNumber,
  reserves: ReservesType,
  tradeType?: TradeType,
) {
  if (!currencyIn || !currencyOut) return '0';

  const isToken0 = currencyIn.contract === reserves.token0;

  const reserve0 = isToken0 ? reserves.reserve0 : reserves.reserve1;
  const reserve1 = isToken0 ? reserves.reserve1 : reserves.reserve0;

  if (reserve0 && reserve1) {
    const reserveInAfter = reserve0.plus(amountIn);
    const expectedAmount = await getExpectedAmountNew(currencyIn, currencyOut, amountIn, reserves);
    const reserveOutAfter = reserve1.minus(expectedAmount);

    const reservesNew = {
      token0: currencyIn.contract,
      token1: currencyOut.contract,
      reserve0: reserveInAfter,
      reserve1: reserveOutAfter,
    };

    const expectedAmountAfter = await getExpectedAmountNew(
      currencyIn,
      currencyOut,
      amountIn,
      reservesNew,
      tradeType,
    );

    const price0 = expectedAmount.dividedBy(amountIn);
    const price1 = expectedAmountAfter.dividedBy(amountIn);

    return price0.minus(price1).dividedBy(price0);
  } else {
    return '0';
  }
}
