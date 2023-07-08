import { SorobanContextType } from "@soroban-react/core";
import { useContractValue } from "@soroban-react/contracts";
import { accountToScVal, scvalToString } from "../helpers/utils";
import { useFactory } from "./useFactory";
import BigNumber from "bignumber.js";

export function useSlipaggeFactor(
): BigNumber {
    return new BigNumber(0.9);
}
