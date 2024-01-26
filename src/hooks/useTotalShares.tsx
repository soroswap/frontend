import { useContractValue } from "@soroban-react/contracts";
import { SorobanContextType } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { xdr } from 'stellar-sdk';

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
    method: "total_supply",
    args,
    sorobanContext: sorobanContext,
  });

  if (totalShares_scval.result) {
    totalShares = scvalToBigNumber(totalShares_scval.result)
  } else return undefined;
  return totalShares;
}
