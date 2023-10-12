import { contractInvoke } from "@soroban-react/contracts";
import { useSorobanReact } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { AppContext, SnackbarIconType } from "contexts";
import { sendNotification } from "functions/sendNotification";
import { formatTokenAmount } from "helpers/format";
import { bigNumberToI128 } from "helpers/utils";
import { useCallback, useContext } from "react";
import * as SorobanClient from "soroban-client";
import { xdr } from "soroban-client";
import { InterfaceTrade } from "state/routing/types";

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
  const { activeChain, address } = sorobanContext

  return useCallback(async () => {
    console.log("Trying out the TRADE")
    if (!trade) throw new Error('missing trade')
    if (!address || !activeChain) throw new Error('wallet must be connected to swap')

    const pairAddress = trade.swaps[0].route.pairs[0].pairAddress
    // TODO, this is just temporal, when implementing the Router we'll calculate this better 
    //(12-10-2023) Amounts that are too large will fail with a panic exit, this will depend on the amounts in the liquidity pool
    //Thats why we are incrementing the inputAmount by 50% so it doesnt fail, this should be fixed when we implement the router
    const amountInBigNumber= BigNumber(trade.inputAmount?.value|| 0).multipliedBy(1.5)
    const amountInScVal = bigNumberToI128(amountInBigNumber);
    const amountOutBigNumber=BigNumber(trade.outputAmount?.value || 0)
    
    const amountOutScVal = bigNumberToI128(amountOutBigNumber);


    //fn swap(e: Env, to: Address, buy_a: bool, amount_out: i128, amount_in_max: i128);

    let result = await contractInvoke({
      contractAddress: pairAddress as string,
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
    console.log("🚀 « result:", result)

    if (result) {
      console.log("🚀 « result:", result)
      //TODO: Investigate result xdr to get swapped amount and hash, there is a warmHash, is it this one?
      const notificationMessage = `${formatTokenAmount(trade?.inputAmount?.value ?? "0")} ${trade?.inputAmount?.currency.symbol} for ${formatTokenAmount(trade?.outputAmount?.value ?? "0")} ${trade?.outputAmount?.currency.symbol}`
      sendNotification(notificationMessage,'Swapped', SnackbarIconType.SWAP, SnackbarContext)
    }

    //This will connect again the wallet to fetch its data
    sorobanContext.connect();
    return result
  }, [SnackbarContext, activeChain, address, sorobanContext, trade])
}
