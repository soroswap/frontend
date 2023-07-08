import { SorobanContextType } from "@soroban-react/core";
import { useContractValue } from "@soroban-react/contracts";
import { accountToScVal, scvalToBigNumber } from "../helpers/utils";
import { xdr } from "soroban-client";
import BigNumber from "bignumber.js";

export function useAllowance(
  token_address: string,
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
    contractId: token_address,
    method: "allowance",
    params: params,
    sorobanContext: sorobanContext,
  });

  if (allowance_scval.result) {
    allowance = scvalToBigNumber(allowance_scval.result)
  } else return undefined;
  return allowance;
}
