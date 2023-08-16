import { SorobanContextType } from "@soroban-react/core";
import { useContractValue } from "@soroban-react/contracts"
import { accountToScVal, scvalToString } from "../helpers/utils";
import { useFactory } from "./useFactory";
import { xdr } from "soroban-client";
import * as SorobanClient from "soroban-client";

export function usePairContractAddress(
  address_0: string|null,
  address_1: string|null,
  sorobanContext: SorobanContextType,
): string | undefined {
  const random = Math.random(); 
  
  let pairAddress;
  let args: xdr.ScVal[] = [];
  if (address_0 !== null && address_1 !== null) {
    args = [accountToScVal(address_0), accountToScVal(address_1)];
  }
  const factory = useFactory(sorobanContext);
  const pairAddress_scval = useContractValue({
    contractAddress: factory.factory_address,
    method: "get_pair",
    args,
    sorobanContext,
  });
  
  if (pairAddress_scval.result) {
    pairAddress = SorobanClient.Address.fromScVal(
      pairAddress_scval.result,
    ).toString();
    console.log("🚀 ~ file: usePairContactAddress.tsx:32 ~ pairAdress:", pairAddress)
    
  } else return undefined;
  
  console.log("rando: ", random,"🚀 ~ file: usePairContractAddress.tsx:36 ~ pairAddress:", pairAddress)
  return pairAddress;
}
