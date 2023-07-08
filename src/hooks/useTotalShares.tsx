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
  let params: xdr.ScVal[] = [];
  try {
    params = [];
  } catch (error) {}
  const totalShares_scval = useContractValue({
    contractId: pairAddress,
    method: "total_shares",
    params: params,
    sorobanContext: sorobanContext,
  });

  if (totalShares_scval.result) {
    totalShares = scvalToBigNumber(totalShares_scval.result)
  } else return undefined;
  return totalShares;
}
