import { useContractValue } from "@soroban-react/contracts";
import { useEffect, useState } from "react";
import { xdr } from "soroban-client";
import { SorobanContextType, useSorobanReact } from "utils/packages/core/src";
import { accountToScVal } from "../helpers/utils";
import { TokenType } from "../interfaces";
import { useFactory } from "./useFactory";
import { usePairContractAddress } from "./usePairContractAddress";

export function usePairExistScVal(
  token_address_0: string|null,
  token_address_1: string|null,
  sorobanContext: SorobanContextType,
) {
  const [params, setParams] = useState<xdr.ScVal[]>([]);
  useEffect(() => {
    if (token_address_0 !== null && token_address_1 !== null) {
      const addressScVal0 = accountToScVal(token_address_0);
      const addressScVal1 = accountToScVal(token_address_1);
      setParams([]);
      setParams([addressScVal0, addressScVal1]);
    }
  }, [token_address_0, token_address_1])
  const factory = useFactory(sorobanContext);
  const pairExistScVal = useContractValue({
    contractAddress: factory.factory_address,
    method: "pair_exists",
    args: params,
    sorobanContext: sorobanContext,
  });
  return pairExistScVal;
}

function formatBool(pairExistScVal: any) {
  if (!pairExistScVal.result) return false;
  else {
    return pairExistScVal.result.value() as boolean;
  }
}
export function usePairExist( 
  token_address_0: string|null,
  token_address_1: string|null,
  sorobanContext: SorobanContextType,
): boolean {
  const pairExistScVal = usePairExistScVal(
    token_address_0,
    token_address_1,
    sorobanContext,
  );
  const pairExist = formatBool(pairExistScVal);

  return pairExist;
}
export function useTokensWithPair(tokens: TokenType[], inputToken: TokenType) {
  const sorobanContext = useSorobanReact();
  let tokensWithPair: TokenType[] = [];

  tokens.map((token) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const pairExist = usePairExist(
      inputToken.address,
      token.address,
      sorobanContext,
    );

    if (pairExist) {
      tokensWithPair.push(token);
    }
  });

  return tokensWithPair;
}

export function useAllPairsFromTokens(tokens: TokenType[], sorobanContext: SorobanContextType) {

  const allPairs = [];
  for (let i = 0; i < tokens.length; i++) {
    for (let j = i + 1; j < tokens.length; j++) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const pairExist = usePairExist(
        tokens[i].address,
        tokens[j].address,
        sorobanContext,
      );
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const pairAddress = usePairContractAddress(
        tokens[i].address,
        tokens[j].address,
        sorobanContext,
      );

      if (pairExist) {
        allPairs.push({
          token_0: tokens[i],
          token_1: tokens[j],
          pair_address: pairAddress,
        });
      }
    }
  }
  return allPairs;
}
