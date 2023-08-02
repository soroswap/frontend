import { SorobanContextType } from "@soroban-react/core";
import { useContractValue } from "@soroban-react/contracts";
import { accountToScVal, scvalToString } from "../helpers/utils";
import { useFactory } from "./useFactory";
import { xdr } from "soroban-client";
import * as SorobanClient from "soroban-client";

export function usePairContractAddress(
  address_0: string|null,
  address_1: string|null,
  sorobanContext: SorobanContextType,
): string | undefined {
  console.log("🚀 « address_1:", address_1)
  console.log("🚀 « address_0:", address_0)
  let pairAddress;
  let params: xdr.ScVal[] = [];
  if (address_0 !== null && address_1 !== null) {
    params = [accountToScVal(address_0), accountToScVal(address_1)];
  }
  console.log("🚀 « pairAddress:", pairAddress)
  const factory = useFactory(sorobanContext);
  console.log("🚀 « factory:", factory)
  const pairAddress_scval = useContractValue({
    contractId: factory.factory_address,
    method: "get_pair",
    params: params,
    sorobanContext: sorobanContext,
  });
  console.log("🚀 « pairAddress_scval:", pairAddress_scval)

  if (pairAddress_scval.result) {
    pairAddress = SorobanClient.Address.fromScVal(
      pairAddress_scval.result,
    ).toString();
  } else return undefined;
  console.log("🚀 « pairAddress:", pairAddress)
  return pairAddress;
}
