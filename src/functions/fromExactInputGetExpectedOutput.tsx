// import { useSorobanReact } from "@soroban-react/core";
// import { useContractValue } from "@soroban-react/contracts";
// import { accountToScVal } from "../utils";

import { SorobanContextType } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { useReservesBigNumber } from "../hooks/useReserves";

export default function fromExactInputGetExpectedOutput(
  pairAddress: string,
  amountIn: BigNumber,
  reserve0: BigNumber,
  reserve1: BigNumber,
  sorobanContext: SorobanContextType
): BigNumber {

  return getExpectedAmountFromReserves(amountIn, reserve0, reserve1);
}

function getExpectedAmountFromReserves(
  amountIn: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber): BigNumber {
  if (amountIn.isEqualTo(0)) return amountIn;
  if (reserveIn.isEqualTo(0) || reserveOut.isEqualTo(0)) return BigNumber(0);
  let amountInWithFee = amountIn.multipliedBy(997);
  let numerator = amountInWithFee.multipliedBy(reserveOut);
  let denominator = reserveIn.multipliedBy(1000).plus(amountInWithFee);
  return numerator.dividedBy(denominator);
}

export function getPriceImpact(
  pairAddress: string,
  amountIn: BigNumber,
  reserve0: BigNumber,
  reserve1: BigNumber,
  sorobanContext: SorobanContextType) {

  const reserveInAfter = reserve0.plus(amountIn)
  const expectedAmount = fromExactInputGetExpectedOutput(pairAddress, amountIn, reserve0, reserve1, sorobanContext)
  const reserveOutAfter = reserve1.minus(expectedAmount)

  const expectedAmountAfter = getExpectedAmountFromReserves(amountIn, reserveInAfter, reserveOutAfter)

  const price0 = expectedAmount.dividedBy(amountIn)
  const price1 = expectedAmountAfter.dividedBy(amountIn)

  return price0.minus(price1).dividedBy(price0)
}
