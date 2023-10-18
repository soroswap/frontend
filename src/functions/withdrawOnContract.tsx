import { contractInvoke } from "@soroban-react/contracts";
import { SorobanContextType } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { bigNumberToI128 } from "helpers/utils";
import * as SorobanClient from "soroban-client";

interface WithdrawOnContractProps {
  sorobanContext: SorobanContextType;
  pairAddress: string | undefined;
  shareAmount: BigNumber | undefined;
  minA: string | undefined;
  minB: string | undefined;
}

export default async function withdrawOnContract({
  sorobanContext,
  pairAddress,
  shareAmount,
  minA,
  minB
}: WithdrawOnContractProps) {
  console.log("🚀 « pairAddress:", pairAddress)

  const account = sorobanContext.address;
  if (!minA || !minB || !account || !shareAmount || !pairAddress) return;

  const minABN = new BigNumber(minA)
  const minBBN = new BigNumber(minB)

  // const desiredAScVal = bigNumberToI128(minABN.shiftedBy(7));
  // const desiredBScVal = bigNumberToI128(minBBN.shiftedBy(7));

  // TODO: should be using use slippage, here we are adding 5% hardcoded
  const minAScVal = bigNumberToI128(minABN);
  // const minAScVal = bigNumberToI128(minABN.multipliedBy(1.05).decimalPlaces(0));
  const minBScVal = bigNumberToI128(minBBN);
  // const minBScVal = bigNumberToI128(minBBN.multipliedBy(1.05).decimalPlaces(0));

  const shareAmountScVal = bigNumberToI128(shareAmount)

  let result: any;
  try {
    // fn withdraw(e: Env, to: Address, share_amount: i128, min_a: i128, min_b: i128) -> (i128, i128) {
    result = await contractInvoke({
      contractAddress: pairAddress,
      method: "withdraw",
      args: [
        new SorobanClient.Address(account!).toScVal(),
        shareAmountScVal,
        minAScVal,
        minBScVal
      ],
      sorobanContext,
      signAndSend: true,
    })

    console.log("🚀 « result:", result)

    if (result) {
        alert("Success!");
    }


    //This will connect again the wallet to fetch its data
    sorobanContext.connect();
  } catch (error) {
    console.log("🚀 « result:", result)
    console.log("🚀 « error:", error)
  }

}