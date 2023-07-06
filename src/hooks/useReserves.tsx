import BigNumber from "bignumber.js";
import * as SorobanClient from "soroban-client";
import { SorobanContextType } from "@soroban-react/core";
import { useContractValue } from "@soroban-react/contracts";
import { scvalToBigNumber, bigNumberToI128 } from "../helpers/utils";

export function useReservesScVal(
  pairAddress: string,
  sorobanContext: SorobanContextType,
) {
  let reserves;
  const reserves_scval = useContractValue({
    contractId: pairAddress,
    method: "get_reserves",
    params: [],
    sorobanContext: sorobanContext,
  });
  let values: any = reserves_scval.result?.value();
  let scValZero = bigNumberToI128(BigNumber(0));
  let reserve0ScVal: SorobanClient.xdr.ScVal = values
    ? values[0] ?? scValZero
    : scValZero;
  let reserve1ScVal: SorobanClient.xdr.ScVal = values
    ? values[1] ?? scValZero
    : scValZero;
  return {
    reserve0ScVal,
    reserve1ScVal,
  };
}

export function useReservesBigNumber(
  pairAddress: string,
  sorobanContext: SorobanContextType,
) {
  let reservesScVal = useReservesScVal(pairAddress, sorobanContext);

  return {
    reserve0: scvalToBigNumber(reservesScVal.reserve0ScVal),
    reserve1: scvalToBigNumber(reservesScVal.reserve0ScVal),
  };
  // }
}
