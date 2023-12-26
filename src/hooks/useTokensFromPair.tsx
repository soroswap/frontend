import { useContractValue } from "@soroban-react/contracts";
import { SorobanContextType } from "@soroban-react/core";
import * as StellarSdk from "stellar-sdk";

export function useTokensFromPair(
  pairAddress: string,
  sorobanContext: SorobanContextType,
) {

  const token0ScVal = useContractValue({
    contractAddress: pairAddress,
    method: "token_0", 
    args: [],
    sorobanContext: sorobanContext,
  });
  const token1ScVal = useContractValue({
    contractAddress: pairAddress,
    method: "token_1", 
    args: [],
    sorobanContext: sorobanContext,
  });
  let tokens = {
    token0:"",
    token1:""
  }
  if (token0ScVal.result && token1ScVal.result) {
    tokens.token0 = StellarSdk.Address.fromScVal(
      token0ScVal.result,
    ).toString();
    tokens.token1 = StellarSdk.Address.fromScVal(
      token1ScVal.result,
    ).toString();
    return tokens
  } else return undefined;

}
