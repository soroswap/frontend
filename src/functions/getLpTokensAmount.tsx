import { SorobanContextType } from "@soroban-react/core/dist/SorobanContext";
import BigNumber from "bignumber.js";
import { useTotalShares } from "../hooks/useTotalShares";

export default function getLpTokensAmount(
  amount0: BigNumber,
  reserve0: BigNumber,
  pairAddress: string,
  sorobanContext: SorobanContextType,
): BigNumber {
    const totalShares = useTotalShares(pairAddress, sorobanContext)
    if (!totalShares || amount0.isEqualTo(0) || reserve0.isEqualTo(0)) {
        return new BigNumber(0)
    }
    return amount0.dividedBy(reserve0).multipliedBy(totalShares).decimalPlaces(0);
}
