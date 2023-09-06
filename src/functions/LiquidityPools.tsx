import { SorobanContextType } from "@soroban-react/core/dist/SorobanContext";
import BigNumber from "bignumber.js";
import { contractInvoke } from "@soroban-react/contracts";
import { scValStrToJs } from "helpers/convert";

export async function getLpTokensAmount(
    amount0: BigNumber,
    reserve0: BigNumber,
    amount1: BigNumber,
    reserve1: BigNumber,
    pairAddress: string,
    sorobanContext: SorobanContextType,
) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const totalShares = await getTotalShares(pairAddress, sorobanContext)
    if (!totalShares || reserve1.isEqualTo(0) || reserve0.isEqualTo(0)) {
        return amount0.multipliedBy(amount1).squareRoot()
    }
    let LP0 = amount0.multipliedBy(totalShares).dividedBy(reserve0).decimalPlaces(0);
    let LP1 = amount1.multipliedBy(totalShares).dividedBy(reserve1).decimalPlaces(0);
    return BigNumber.min(LP0, LP1)
}

export async function getTotalShares(
    pairAddress: string,
    sorobanContext: SorobanContextType) {
    const totalShares_scval = await contractInvoke({
        contractAddress: pairAddress,
        method: "total_shares",
        sorobanContext: sorobanContext,
    });

    if (totalShares_scval?.xdr) {
        const totalShares = scValStrToJs(totalShares_scval?.xdr)
        return totalShares
    } else return undefined
}
