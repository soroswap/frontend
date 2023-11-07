import { SorobanContextType } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { reservesBNWithTokens } from 'hooks/useReserves';
import { TokenType } from 'interfaces';
import { TradeType } from 'state/routing/types';
import fromExactInputGetExpectedOutput from './fromExactInputGetExpectedOutput';
import fromExactOutputGetExpectedInput from './fromExactOutputGetExpectedInput';
import { getPairAddress } from './getPairAddress';

interface customReservesType {
  token0: TokenType;
  token1: TokenType;
  reserve0: BigNumber;
  reserve1: BigNumber;
}

export async function getExpectedAmount(
  currencyIn: TokenType | undefined,
  currencyOut: TokenType | undefined,
  amountIn: BigNumber,
  sorobanContext: SorobanContextType,
  tradeType?: TradeType,
  customReserves?: customReservesType,
) {
  if (!currencyIn || !currencyOut) return BigNumber('0');

  try {
    const pairAddress = await getPairAddress(
      currencyIn.address,
      currencyOut.address,
      sorobanContext,
    );
    const reserves = customReserves ?? (await reservesBNWithTokens(pairAddress, sorobanContext));

    let expectedOutput;
    if (tradeType === TradeType.EXACT_INPUT) {
      expectedOutput = fromExactInputGetExpectedOutput(
        amountIn,
        reserves.reserve0,
        reserves.reserve1,
      );
    } else {
      expectedOutput = fromExactOutputGetExpectedInput(
        amountIn,
        reserves.reserve0,
        reserves.reserve1,
      );
    }

    return expectedOutput;
  } catch (error) {
    return BigNumber(0);
  }
}

export interface ReservesType {
  reserve0: BigNumber | undefined;
  reserve1: BigNumber | undefined;
  token0?: string;
  token1?: string;
}
//This function do not call pairAddress and reservesBNWithTokens every time the input changes, instead it uses the reserves passed as argument
export async function getExpectedAmountNew(
  currencyIn: TokenType | undefined,
  currencyOut: TokenType | undefined,
  amountIn: BigNumber,
  reserves: ReservesType,
  tradeType?: TradeType,
) {
  if (!currencyIn || !currencyOut) return BigNumber('0');

  try {
    let expectedOutput;
    if (tradeType === TradeType.EXACT_INPUT) {
      expectedOutput = fromExactInputGetExpectedOutput(
        amountIn,
        reserves.reserve0,
        reserves.reserve1,
      );
    } else {
      expectedOutput = fromExactOutputGetExpectedInput(
        amountIn,
        reserves.reserve0,
        reserves.reserve1,
      );
    }

    return expectedOutput;
  } catch (error) {
    return BigNumber(0);
  }
}
