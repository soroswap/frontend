// import { useSorobanReact } from "@soroban-react/core";
// import { useContractValue } from "@soroban-react/contracts";
// import { accountToScVal } from "../utils";

import { SorobanContextType } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { useReservesBigNumber } from "../hooks/useReserves";

export default function getExpectedAmount(
  pairAddress: string,
  amountIn: BigNumber,
  sorobanContext: SorobanContextType
): BigNumber {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const reserves = useReservesBigNumber(pairAddress, sorobanContext);
  let reserveIn = reserves.reserve0
  let reserveOut = reserves.reserve1

  return getExpectedAmountFromReserves(amountIn, reserveIn, reserveOut);
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
  sorobanContext: SorobanContextType) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const reserves = useReservesBigNumber(pairAddress, sorobanContext);
  const reserveIn = reserves.reserve0
  const reserveOut = reserves.reserve1

  const reserveInAfter = reserveIn.plus(amountIn)
  const expectedAmount = getExpectedAmount(pairAddress, amountIn, sorobanContext)
  const reserveOutAfter = reserveOut.minus(expectedAmount)

  const expectedAmountAfter = getExpectedAmountFromReserves(amountIn, reserveInAfter, reserveOutAfter)

  const price0 = expectedAmount.dividedBy(amountIn)
  const price1 = expectedAmountAfter.dividedBy(amountIn)

  return price0.minus(price1).dividedBy(price0)
}
