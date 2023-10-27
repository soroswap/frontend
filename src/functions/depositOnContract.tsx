import { contractInvoke } from "@soroban-react/contracts";
import { SorobanContextType } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { bigNumberToI128 } from "helpers/utils";
import * as SorobanClient from "soroban-client";

interface DepositOnContractProps {
  sorobanContext: SorobanContextType;
  pairAddress: string | undefined;
  amount0: string;
  amount1: string;
}

function print(...args: any[]): void {
  const prefix = "functions/depositOnContract, ";
  console.log(prefix, ...args);
}

export default async function depositOnContract({
  sorobanContext,
  pairAddress,
  amount0,
  amount1
}: DepositOnContractProps) {

  const account = sorobanContext.address;

  if (!account) {
    console.log("Error on account:", account)
    return;
  }

  const amount0BN = new BigNumber(amount0)
  const amount1BN = new BigNumber(amount1)

  const desiredAScVal = bigNumberToI128(amount0BN.shiftedBy(7));
  const desiredBScVal = bigNumberToI128(amount1BN.shiftedBy(7));

  const minAScVal = bigNumberToI128(amount0BN.multipliedBy(0.9).decimalPlaces(0).shiftedBy(7));
  const minBScVal = bigNumberToI128(amount1BN.multipliedBy(0.9).decimalPlaces(0).shiftedBy(7));

  let result: any;
  try {
    result = await contractInvoke({
        contractAddress: pairAddress ? pairAddress : "",
        method: "deposit",
        args: [
            new SorobanClient.Address(account!).toScVal(),
            desiredAScVal,
            minAScVal,
            desiredBScVal,
            minBScVal
        ],
        sorobanContext,
        signAndSend: true,
        // secretKey: ""
    })
    print("result:", result.toString())

    if (result) {
        alert("Success!");
    }


    //This will connect again the wallet to fetch its data
    sorobanContext.connect();
  } catch (error) {
    print(result)
    print("🚀 « error: contractInvoke: ", error);
  }

}