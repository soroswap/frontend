import { useContractValue } from "@soroban-react/contracts";
import { SorobanContextType } from "@soroban-react/core";
import { useMemo } from "react";
import * as SorobanClient from "soroban-client";
import { accountToScVal } from "../helpers/utils";
import { useFactory } from "./useFactory";

export function usePairContractAddress(
  address_0: string | null,
  address_1: string | null,
  sorobanContext: SorobanContextType,
): string | undefined {
  const random = Math.random();

  const args = useMemo(() => {

    if (address_0 !== null && address_1 !== null) {
      // args = [accountToScVal(address_0), accountToScVal(address_1)];
      return [accountToScVal(address_0), accountToScVal(address_1)];
    }
  }, [address_0, address_1])

  const factory = useFactory(sorobanContext);
  const pairAddress_scval = useContractValue({
    contractAddress: factory.factory_address,
    method: "get_pair",
    args,
    sorobanContext,
  });
  const pairAddress = useMemo(() => {
    if (pairAddress_scval.result) {
      return SorobanClient.Address.fromScVal(
        pairAddress_scval.result,
      ).toString();

    } else return undefined;

  }, [pairAddress_scval])

  return pairAddress;
}
