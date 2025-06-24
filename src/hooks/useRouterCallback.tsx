import { contractInvoke } from 'stellar-react';

import { useSorobanReact } from 'stellar-react';
import { useCallback } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { useSWRConfig } from 'swr';
import { useRouterAddress } from './useRouterAddress';
import { TxResponse } from 'stellar-react/dist/contracts/types';

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
export const revalidateKeysCondition = (key: any) => {
  const revalidateKeys = new Set([
    'balance',
    'lp-tokens',
    'reserves',
    'trade',
    'subscribed-pairs',
    'currencyBalance',
    'horizon-account',
    'swap-network-fees',
  ]);

  return Array.isArray(key) && key.some((k) => revalidateKeys.has(k));
};

export function useRouterCallback() {
  const sorobanContext = useSorobanReact();
  const { router } = useRouterAddress();
  const router_address = router!;
  const { mutate } = useSWRConfig();

  return useCallback(
    async (method: RouterMethod, args?: StellarSdk.xdr.ScVal[], signAndSend?: boolean) => {
      let result = (await contractInvoke({
        contractAddress: router_address as string,
        method: method,
        args: args,
        sorobanContext,
        signAndSend: signAndSend,
        reconnectAfterTx: false,
        fee: `1000`,
      })) as TxResponse;

      //If is only a simulation return the result
      if (!signAndSend) return result;

      if (
        isObject(result) &&
        result?.status !== StellarSdk.rpc.Api.GetTransactionStatus.SUCCESS
      )
        throw result;

      mutate((key: any) => revalidateKeysCondition(key), undefined, { revalidate: true });

      return result;
    },
    [router_address, sorobanContext, mutate],
  );
}
