import { TxResponse, contractInvoke } from '@soroban-react/contracts';

import { useSorobanReact } from '@soroban-react/core';
import { useCallback } from 'react';
import * as StellarSdk from 'stellar-sdk';
import { useRouterAddress } from './useRouterAddress';
import { useSWRConfig } from 'swr';

export enum RouterMethod {
  ADD_LIQUIDITY = 'add_liquidity',
  REMOVE_LIQUIDITY = 'remove_liquidity',
  SWAP_EXACT_IN = 'swap_exact_tokens_for_tokens',
  SWAP_EXACT_OUT = 'swap_tokens_for_exact_tokens',
  QUOTE = 'router_quote',
  GET_AMOUNT_OUT = 'router_get_amount_out',
  GET_AMOUNT_IN = 'router_get_amount_in',
  GET_AMOUNTS_OUT = 'router_get_amounts_out',
  GET_AMOUNTS_IN = 'router_get_amounts_in',
}

// Returns a function that will execute a any method on RouterContract, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade

const isObject = (val: any) => typeof val === 'object' && val !== null && !Array.isArray(val);

//refetch balance, lptokens and reserves after router tx success
const revalidateKeysCondition = (key: any) =>
  Array.isArray(key) &&
  (key.includes('balance') || key.includes('lp-tokens') || key.includes('reserves'));

export function useRouterCallback() {
  const sorobanContext = useSorobanReact();
  const { router } = useRouterAddress();
  const router_address = router?.router_address;
  const { mutate } = useSWRConfig();

  return useCallback(
    async (method: RouterMethod, args?: StellarSdk.xdr.ScVal[], signAndSend?: boolean) => {
      console.log('🚀 ~ file: useRouterCallback.tsx:34 ~ contractAddress:', router_address);
      console.log('🚀 ~ file: useRouterCallback.tsx:36 ~ method:', method);
      console.log('🚀 ~ file: useRouterCallback.tsx:38 ~ args:', args);
      console.log('🚀 ~ file: useRouterCallback.tsx:40 ~ sorobanContext:', sorobanContext);
      console.log('🚀 ~ file: useRouterCallback.tsx:42 ~ signAndSend:', signAndSend);

      let result = (await contractInvoke({
        contractAddress: router_address as string,
        method: method,
        args: args,
        sorobanContext,
        signAndSend: signAndSend,
        reconnectAfterTx: false,
      })) as TxResponse;
      console.log("🚀 ~ file: useRouterCallback.tsx:45 ~ result:", result)

      if (
        isObject(result) &&
        result?.status !== StellarSdk.SorobanRpc.Api.GetTransactionStatus.SUCCESS
      )
        throw result;

      mutate((key: any) => revalidateKeysCondition(key), undefined, { revalidate: true });

      return result;
    },
    [router_address, sorobanContext, mutate],
  );
}
