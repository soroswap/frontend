// import { useSorobanReact } from "@soroban-react/core";
// import { useContractValue } from "@soroban-react/contracts";
// import { accountToScVal } from "../utils";

import { SorobanContextType } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { useReservesBigNumber } from "../hooks/useReserves";

export default function fromExactOutputGetExpectedInput(
  pairAddress: string,
  amountIn: BigNumber,
  reserve0: BigNumber,
  reserve1: BigNumber,
  sorobanContext: SorobanContextType
): BigNumber {

  return getExpectedAmountFromReserves(amountIn, reserve0, reserve1);
}

function getExpectedAmountFromReserves(
  amountOut: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber): BigNumber {
  if (amountOut.isEqualTo(0)) return amountOut;
  if (reserveIn.isEqualTo(0) || reserveOut.isEqualTo(0)) return BigNumber(0);
  let numerator = reserveIn.multipliedBy(amountOut).multipliedBy(1000);
  let denominator = reserveOut.minus(amountOut).multipliedBy(997);
  return (numerator.dividedBy(denominator)).plus(1);
}