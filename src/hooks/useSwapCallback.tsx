import { contractInvoke } from "@soroban-react/contracts";
import { useSorobanReact } from "@soroban-react/core";
import { useCallback, useContext } from "react";
import { xdr } from "soroban-client";
import { InterfaceTrade } from "state/routing/types";
import * as SorobanClient from "soroban-client";
import BigNumber from "bignumber.js";
import { bigNumberToI128 } from "helpers/utils";
import { sendNotification } from "functions/sendNotification";
import { AppContext, SnackbarIconType } from "contexts";
import { formatTokenAmount } from "helpers/format";

// Returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: InterfaceTrade | undefined, // trade to execute, required
  // fiatValues: { amountIn?: number; amountOut?: number }, // usd values for amount in and out, logged for analytics
  // allowedSlippage: Percent, // in bips
  // permitSignature: PermitSignature | undefined
) {
  const { SnackbarContext } = useContext(AppContext)
  const sorobanContext = useSorobanReact()
  const {activeChain, address} = sorobanContext
  
  return useCallback(async () => {
    console.log("Trying out the TRADE")
    if (!trade) throw new Error('missing trade')
    if (!address || !activeChain) throw new Error('wallet must be connected to swap')

    const pairAddress = trade.swaps[0].route.pairs[0].pairAddress
    const amountInScVal = bigNumberToI128(BigNumber(trade.inputAmount.value))
    // console.log("🚀 « trade.inputAmount:", trade.inputAmount.value)
    const amountOutScVal = bigNumberToI128(BigNumber(trade.outputAmount.value))
    // console.log("🚀 « trade.outputAmount:", trade.outputAmount.value)

    let result = await contractInvoke({
      contractAddress: pairAddress,
      method: "swap",
      args: [
        new SorobanClient.Address(address!).toScVal(),
        xdr.ScVal.scvBool((trade.tradeType === 0)),
        amountOutScVal,
        amountInScVal,
      ],
      sorobanContext,
      signAndSend: true,
    })

    if (result) {
      console.log("🚀 « result:", result)
      //TODO: Investigate result xdr to get swapped amount and hash, there is a warmHash, is it this one?
      const notificationMessage = `${formatTokenAmount(trade.inputAmount.value)} ${trade.inputAmount.currency.symbol} for ${formatTokenAmount(trade.outputAmount.value)} ${trade.outputAmount.currency.symbol}`
      sendNotification(notificationMessage,'Swapped', SnackbarIconType.SWAP, SnackbarContext)
    }

    //This will connect again the wallet to fetch its data
    sorobanContext.connect();
    return result
  }, [SnackbarContext, activeChain, address, sorobanContext, trade])
}
