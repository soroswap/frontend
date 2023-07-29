import { SorobanContextType } from "@soroban-react/core";
import { useContractValue } from "@soroban-react/contracts";
import { accountToScVal } from "../helpers/utils";
import { useFactory } from "./useFactory";
import { TokenType } from "../interfaces";
import { useSorobanReact } from "@soroban-react/core";
import { usePairContractAddress } from "./usePairContractAddress";
import { xdr } from "soroban-client";
import { useEffect, useState } from "react";

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
  console.log(params)
  const pairExistScVal = useContractValue({
    contractId: factory.factory_address,
    method: "pair_exists",
    params: params,
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
    console.log("🚀 ~ file: usePairExist.tsx:61 ~ tokens.map ~ token:", token);
    console.log(
      "🚀 ~ file: usePairExist.tsx:59 ~ tokens.map ~ inputToken:",
      inputToken,
    );
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const pairExist = usePairExist(
      inputToken.token_address,
      token.token_address,
      sorobanContext,
    );
    console.log(
      "🚀 ~ file: usePairExist.tsx:59 ~ tokens.map ~ pairExist:",
      pairExist,
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
        tokens[i].token_address,
        tokens[j].token_address,
        sorobanContext,
      );
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const pairAddress = usePairContractAddress(
        tokens[i].token_address,
        tokens[j].token_address,
        sorobanContext,
      );

      if (pairExist) {
        console.log("pair address", pairAddress);
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
