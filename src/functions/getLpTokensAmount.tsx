import { SorobanContextType } from "@soroban-react/core/dist/SorobanContext";
import BigNumber from "bignumber.js";
import { useTotalShares } from "../hooks/useTotalShares";

export default function getLpTokensAmount(
  amount0: BigNumber,
  reserve0: BigNumber,
  amount1: BigNumber,
  reserve1: BigNumber,
  pairAddress: string,
  sorobanContext: SorobanContextType,
): BigNumber {
    const totalShares = useTotalShares(pairAddress, sorobanContext)
    if (!totalShares || reserve1.isEqualTo(0) || reserve0.isEqualTo(0)) {
        return amount0.multipliedBy(amount1).squareRoot()
    }
    let LP0=amount0.multipliedBy(totalShares).dividedBy(reserve0).decimalPlaces(0);
    let LP1=amount1.multipliedBy(totalShares).dividedBy(reserve1).decimalPlaces(0);
    return BigNumber.min(LP0, LP1)
}