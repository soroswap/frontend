import { contractInvoke, useSorobanReact } from 'stellar-react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { useCallback } from 'react';
import { useAggregator } from './useAggregator';
import { TxResponse } from 'stellar-react/dist/contracts/types';

export enum AggregatorMethod {
  GET_PROTOCOLS = 'get_protocols',
  IS_PROTOCOL_PAUSED = 'is_protocol_paused',
  SWAP_EXACT_IN = 'swap_exact_tokens_for_tokens',
  SWAP_EXACT_OUT = 'swap_tokens_for_exact_tokens',
}

// fn swap(
//   e: Env,
//   from_token: Address,
//   dest_token: Address,
//   amount: i128,
//   amount_out_min: i128,
//   distribution: Vec<DexDistribution>,
//   to: Address,
//   deadline: u64,
// ) -> Result<Vec<i128>, AggregatorError>;

const isObject = (val: any) => typeof val === 'object' && val !== null && !Array.isArray(val);

export function useAggregatorCallback() {
  const sorobanContext = useSorobanReact();
  const { address: aggregator_address } = useAggregator();

  return useCallback(
    async (method: AggregatorMethod, args?: StellarSdk.xdr.ScVal[], signAndSend?: boolean) => {
      if (!args) return;

      let result = (await contractInvoke({
        contractAddress: aggregator_address as string,
        method: method,
        args: args,
        sorobanContext,
        signAndSend: signAndSend,
        reconnectAfterTx: false,
      })) as TxResponse;

      //If is only a simulation return the result
      if (!signAndSend) return result;

      if (
        isObject(result) &&
        result?.status !== StellarSdk.SorobanRpc.Api.GetTransactionStatus.SUCCESS
      )
        throw result;

      return result;
    },
    [aggregator_address, sorobanContext],
  );
}
