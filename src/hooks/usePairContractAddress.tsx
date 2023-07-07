import { SorobanContextType } from "@soroban-react/core";
import { useContractValue } from "@soroban-react/contracts";
import { accountToScVal, scvalToString } from "../helpers/utils";
import { useFactory } from "./useFactory";
import { xdr } from "soroban-client";
import * as SorobanClient from "soroban-client";

export function usePairContractAddress(
  address_0: string,
  address_1: string,
  sorobanContext: SorobanContextType,
): string | undefined {
  let pairAddress;
  let params: xdr.ScVal[] = [];
  try {
    params = [accountToScVal(address_0), accountToScVal(address_1)];
  } catch (error) {}
  const factory = useFactory(sorobanContext);
  const pairAddress_scval = useContractValue({
    contractId: factory.factory_address,
    method: "get_pair",
    params: params,
    sorobanContext: sorobanContext,
  });

  if (pairAddress_scval.result) {
    pairAddress = SorobanClient.Address.fromScVal(pairAddress_scval.result).toString();
  } else return undefined;
  return pairAddress;
}
