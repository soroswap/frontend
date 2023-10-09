import { useContractValue } from "@soroban-react/contracts";
import { SorobanContextType } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { xdr } from "soroban-client";
import { accountToScVal, scvalToBigNumber } from "../helpers/utils";

export function useAllowance(
  address: string,
  from: string,
  spender: string,
  sorobanContext: SorobanContextType,
): BigNumber | undefined {
  let allowance;
  let params: xdr.ScVal[] = [];
  try {
    params = [accountToScVal(from), accountToScVal(spender)];
  } catch (error) {}
  const allowance_scval = useContractValue({
    contractAddress: address,
    method: "allowance",
    args: params,
    sorobanContext: sorobanContext,
  });

  if (allowance_scval.result) {
    allowance = scvalToBigNumber(allowance_scval.result)
  } else return undefined;
  return allowance;
}
