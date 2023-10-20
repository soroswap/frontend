import { contractInvoke } from "@soroban-react/contracts";
import { useSorobanReact } from "@soroban-react/core";
import { useCallback } from "react";
import * as SorobanClient from 'soroban-client';
import { useRouterAddress } from "./useRouterAddress";

// Returns a function that will execute a any method on RouterContract, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useRouterContract() {
  const sorobanContext = useSorobanReact()
  const { router_address } = useRouterAddress()
  
  return useCallback(async (
    method: string,
    args?: SorobanClient.xdr.ScVal[],
    signAndSend?: boolean
  ) => {
    
    let result = await contractInvoke({
      contractAddress: router_address as string,
      method: method,
      args: args,
      sorobanContext,
      signAndSend: signAndSend,
    })

    return result
  }, [router_address, sorobanContext])
}
