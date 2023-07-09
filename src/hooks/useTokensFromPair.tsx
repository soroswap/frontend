import BigNumber from "bignumber.js";
import * as SorobanClient from "soroban-client";
import { SorobanContextType } from "@soroban-react/core";
import { useContractValue } from "@soroban-react/contracts";

export function useTokensFromPair(
  pairAddress: string,
  sorobanContext: SorobanContextType,
) {

  const token0ScVal = useContractValue({
    contractId: pairAddress,
    method: "token_0", 
    params: [],
    sorobanContext: sorobanContext,
  });
  const token1ScVal = useContractValue({
    contractId: pairAddress,
    method: "token_1", 
    params: [],
    sorobanContext: sorobanContext,
  });
  let tokens = {
    token0:"",
    token1:""
  }
  if (token0ScVal.result && token1ScVal.result) {
    tokens.token0 = SorobanClient.Address.fromScVal(
      token0ScVal.result,
    ).toString();
    tokens.token1 = SorobanClient.Address.fromScVal(
      token1ScVal.result,
    ).toString();
    return tokens
  } else return undefined;

}
