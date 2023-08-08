import { SorobanContextType } from "@soroban-react/core";
import { useContractValue } from "@soroban-react/contracts";
import { accountToScVal, scvalToString } from "../helpers/utils";
import { useFactory } from "./useFactory";
import { xdr } from "soroban-client";
import * as SorobanClient from "soroban-client";
import { useEffect, useMemo, useState } from "react";

export function usePairContractAddress(
  address_0: string|null,
  address_1: string|null,
  sorobanContext: SorobanContextType,
): string | undefined {
  const random = Math.random(); 
  console.log("rando: ", random,"🚀 ~ file: usePairContractAddress.tsx:13 ~ address_1:", address_1)
  console.log("rando: ", random,"🚀 ~ file: usePairContractAddress.tsx:13 ~ address_0:", address_0)
  const [pairAddress, setPairAddress] = useState<string | undefined>(undefined)
  const params:xdr.ScVal[] = useMemo(() => {
    if (address_0 !== null && address_1 !== null) {
      return [accountToScVal(address_0), accountToScVal(address_1)]
      } else {
        return []
      }
  }, [address_0, address_1])

  const factory = useFactory(sorobanContext);
  const pairAddress_scval = useContractValue({
    contractId: factory.factory_address,
    method: "get_pair",
    params: params,
    sorobanContext: sorobanContext,
  });
  console.log("rando: ", random,"🚀 ~ file: usePairContractAddress.tsx:29 ~ pairAddress_scval:", pairAddress_scval)

  if (pairAddress_scval.result) {
    setPairAddress(
      SorobanClient.Address.fromScVal(
        pairAddress_scval.result,
      ).toString()
    )
    console.log("rando: ", random,"🚀 ~ file: usePairContractAddress.tsx:36 ~ pairAddress:", pairAddress)
  } else return undefined;
  
  console.log("rando: ", random,"🚀 ~ file: usePairContractAddress.tsx:36 ~ pairAddress:", pairAddress)
  return pairAddress;
}
