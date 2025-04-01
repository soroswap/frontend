import { SorobanContextType } from 'stellar-react';
import BigNumber from 'bignumber.js';

export default function fromExactInputGetExpectedOutput(
  amountIn: BigNumber | undefined,
  reserve0: BigNumber | undefined,
  reserve1: BigNumber | undefined,
  decimals: number = 7,
): BigNumber {
  if (!amountIn || !reserve0 || !reserve1) return BigNumber(0);

  return getExpectedAmountFromReserves(amountIn, reserve0, reserve1).dp(decimals); //TODO: dp is like toFixed(2) to force it to give 2 decimals, should it be the decimals of the token?
}

function getExpectedAmountFromReserves(
  amountIn: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber,
): BigNumber {
  if (amountIn.isEqualTo(0)) return amountIn;
  if (reserveIn.isEqualTo(0) || reserveOut.isEqualTo(0)) return BigNumber(0);
  let amountInWithFee = amountIn.multipliedBy(997);
  let numerator = amountInWithFee.multipliedBy(reserveOut);
  let denominator = reserveIn.multipliedBy(1000).plus(amountInWithFee);
  return numerator.dividedBy(denominator);
}
