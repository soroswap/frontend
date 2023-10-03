import { contractInvoke } from "@soroban-react/contracts";
import BigNumber from "bignumber.js";
import { scValStrToJs } from "helpers/convert";
import { SorobanContextType } from "utils/packages/core/src";

export async function getTotalLpShares(
  pairAddress: string,
  sorobanContext: SorobanContextType,
) {

  try {
    const response = await contractInvoke({
      contractAddress: pairAddress,
      method: "total_shares",
      sorobanContext,
    })
    
    return scValStrToJs(response?.xdr ?? "") as BigNumber.Value;  
  } catch (error) {
    console.log("error getting totalLpShares", error)
    return BigNumber("0");
  }
}

