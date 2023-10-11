import { contractInvoke } from "@soroban-react/contracts";
import { SorobanContextType } from "@soroban-react/core";
import { addressToScVal, scValToJs } from "helpers/convert";
import { xdr } from 'soroban-client';
import { getFactory } from "./getFactory";

export async function getPairAddress(
  address_0: string | undefined,
  address_1: string | undefined,
  sorobanContext: SorobanContextType
) {
  if(!address_0 || !address_1) return ""
  const factory = await getFactory(sorobanContext)
    
  const response = await contractInvoke({
    contractAddress: factory.factory_address,
    method: "get_pair",
    args: [
      addressToScVal(address_0),
      addressToScVal(address_1),
    ],
    sorobanContext,
  })

  if (response) {
    const pairAddress = scValToJs(response as xdr.ScVal) as string
    return pairAddress
  } else {
    return ""
  }
}