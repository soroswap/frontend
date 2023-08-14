import { SorobanContextType } from "@soroban-react/core";
import { useContractValue } from "@soroban-react/contracts";
import { accountToScVal, scvalToBigNumber, scvalToString } from "../helpers/utils";
import { useFactory } from "./useFactory";
import { xdr } from "soroban-client";
import BigNumber from "bignumber.js";

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
