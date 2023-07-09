// import { useSorobanReact } from "@soroban-react/core";
// import { useContractValue } from "@soroban-react/contracts";
// import { accountToScVal } from "../utils";

export default function getExpectedAmount(
  pairAddress: string,
  amountIn: BigNumber,
  sorobanContext: SorobanContextType
): BigNumber {
    const reserves = useReservesBigNumber(pairAddress, sorobanContext);
    let reserveIn = reserves.reserve0
    let reserveOut = reserves.reserve1


    if (amountIn.isEqualTo(0)) return amountIn;
    if (reserveIn.isEqualTo(0) || reserveOut.isEqualTo(0)) return BigNumber(0);
    let amountInWithFee = amountIn.multipliedBy(997);
    let numerator = amountInWithFee.multipliedBy(reserveOut);
    let denominator = reserveIn.multipliedBy(1000).plus(amountInWithFee);
    return numerator.dividedBy(denominator);
}
