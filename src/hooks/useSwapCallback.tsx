import { contractInvoke } from "@soroban-react/contracts";
import { useSorobanReact } from "@soroban-react/core";
import { useCallback } from "react";
import { xdr } from "soroban-client";
import { InterfaceTrade } from "state/routing/types";
import * as SorobanClient from "soroban-client";
import BigNumber from "bignumber.js";
import { bigNumberToI128 } from "helpers/utils";

// Returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: InterfaceTrade | undefined, // trade to execute, required
  // fiatValues: { amountIn?: number; amountOut?: number }, // usd values for amount in and out, logged for analytics
  // allowedSlippage: Percent, // in bips
  // permitSignature: PermitSignature | undefined
) {
  const sorobanContext = useSorobanReact()
  const {activeChain, address} = sorobanContext
  
  return useCallback(async () => {
    console.log("Trying out the TRADE")
    if (!trade) throw new Error('missing trade')
    if (!address || !activeChain) throw new Error('wallet must be connected to swap')

    const pairAddress = trade.swaps[0].route.pairs[0].pairAddress
    const amountInScVal = bigNumberToI128(BigNumber(trade.inputAmount.value).shiftedBy(7))
    const amountOutScVal = bigNumberToI128(BigNumber(trade.outputAmount.value).shiftedBy(7))

    let result = await contractInvoke({
      contractAddress: pairAddress,
      method: "swap",
      args: [
        new SorobanClient.Address(address!).toScVal(),
        xdr.ScVal.scvBool(true),
        amountOutScVal,
        amountInScVal,
      ],
      sorobanContext,
      signAndSend: true,
    })
    console.log("🚀 « result:", result)

    return result
  }, [activeChain, address, sorobanContext, trade])
}
