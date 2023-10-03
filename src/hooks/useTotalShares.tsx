import { useContractValue } from "@soroban-react/contracts";
import BigNumber from "bignumber.js";
import { xdr } from "soroban-client";
import { SorobanContextType } from "utils/packages/core/src";
import { scvalToBigNumber } from "../helpers/utils";

export function useTotalShares(
  pairAddress: string,
  sorobanContext: SorobanContextType,
): BigNumber | undefined {
    let totalShares;
  let args: xdr.ScVal[] = [];
  try {
    args = [];
  } catch (error) {}
  const totalShares_scval = useContractValue({
    contractAddress: pairAddress,
    method: "total_shares",
    args,
    sorobanContext: sorobanContext,
  });

  if (totalShares_scval.result) {
    totalShares = scvalToBigNumber(totalShares_scval.result)
  } else return undefined;
  return totalShares;
}
