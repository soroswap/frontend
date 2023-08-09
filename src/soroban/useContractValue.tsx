import { SorobanContextType } from '@soroban-react/core'
import React from 'react'

import * as SorobanClient from 'soroban-client'
import { addressToScVal, scValStrToJs } from './src/convert'
import { FactoryType } from 'interfaces/factory'

let xdr = SorobanClient.xdr

// Dummy source account for simulation. The public key for this is all 0-bytes.
const defaultAddress =
  'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'

export type ContractValueType = {
  loading?: true
  result?: SorobanClient.xdr.ScVal
  error?: string | unknown
}

export interface useContractValueProps {
  contractId: string
  method: string
  params?: SorobanClient.xdr.ScVal[] | undefined
  source?: SorobanClient.Account
  sorobanContext: SorobanContextType
}

// useContractValue is a hook that fetches the value of a contract method. It
// might be better named `useSimulateTransaction`, but not sure which is more clear...
// TODO: Allow user to specify the wallet of the submitter, fees, etc... Maybe
// a separate (lower-level) hook for `useSimulateTransaction` would be cleaner?
export function useContractValue({
  contractId,
  method,
  params,
  source,
  sorobanContext,
}: useContractValueProps): ContractValueType {
  const { activeChain, address, server } = sorobanContext

  const [value, setValue] = React.useState<ContractValueType>({ loading: true })
  const [xdrParams, setXdrParams] = React.useState<any>(
    params ? params.map(p => p.toXDR().toString('base64')) : undefined
  )

  React.useEffect(() => {
    source = source ?? new SorobanClient.Account(address ?? defaultAddress, '0')
    if (!activeChain) {
      setValue({ error: 'No active chain' })
      return
    }
    if (!server) {
      setValue({ error: 'Not connected to server' })
      return
    }

    ;(async () => {
      setValue({ loading: true })
      try {
        let result = await fetchContractValue({
          server: server,
          networkPassphrase: activeChain.networkPassphrase,
          contractId: contractId,
          method: method,
          params: params,
          source: source,
        })
        setValue({ result })
      } catch (error) {
        if (typeof error == 'string') {
          setValue({ error })
          return
        }
        if ('message' in (error as any)) {
          setValue({ error: (error as any).message })
          return
        }
        setValue({ error })
      }
    })()
    // Have this re-fetch if the contractId/method/params change. Total hack with
    // xdr-base64 to enforce real equality instead of object equality
    // shenanigans.
  }, [contractId, method, xdrParams, activeChain, server])
  return value
}

export interface fetchContractValueProps {
  server: SorobanClient.Server
  networkPassphrase: string
  contractId: string
  method: string
  params?: SorobanClient.xdr.ScVal[] | undefined
  source: SorobanClient.Account
}

async function fetchContractValue({
  server,
  networkPassphrase,
  contractId,
  method,
  params,
  source,
}: fetchContractValueProps): Promise<SorobanClient.xdr.ScVal> {
  const contract = new SorobanClient.Contract(contractId)

  let myParams: SorobanClient.xdr.ScVal[] = params || []

  // TODO: Optionally include the wallet of the submitter here, so the
  // simulation is more accurate
  const transaction = new SorobanClient.TransactionBuilder(source, {
    // fee doesn't matter, we're not submitting
    fee: '100',
    networkPassphrase,
  })
    .addOperation(contract.call(method, ...myParams))
    .setTimeout(SorobanClient.TimeoutInfinite)
    .build()

  const { results } = await server.simulateTransaction(transaction)
  if (!results || results.length !== 1) {
    throw new Error('Invalid response from simulateTransaction')
  }
  const result = results[0]
  return xdr.ScVal.fromXDR(result.xdr, 'base64')
}

export type Simulation = NonNullable<
  SorobanClient.SorobanRpc.SimulateTransactionResponse["results"]
>[0];

export type TxResponse = SorobanClient.SorobanRpc.GetTransactionResponse;

export type InvokeArgs = {
  contractAddress: string
  method: string;
  args?: SorobanClient.xdr.ScVal[] | undefined
  sorobanContext: SorobanContextType
  fee?: number;
  signAndSend?: boolean;
};

export async function contractInvoke({
  contractAddress,
  method,
  args = [],
  sorobanContext,
  fee = 100,
  signAndSend = false,
}: InvokeArgs) {
  const { server, address, activeChain } = sorobanContext;
  if(!activeChain) return

  // use a placeholder account if not yet connected to Freighter so that view calls can still work
  const account =
    await server?.getAccount(address?? "") ??
    new SorobanClient.Account(
      "GBZXP4PWQLOTBL3P6OE6DQ7QXNYDAZMWQG27V7ATM7P3TKSRDLQS4V7Q",
      "0",
    );

  const contract = new SorobanClient.Contract(contractAddress);

  let tx = new SorobanClient.TransactionBuilder(account, {
    fee: fee.toString(10),
    networkPassphrase: activeChain?.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(SorobanClient.TimeoutInfinite)
    .build();

  const simulated = await server?.simulateTransaction(tx);

  if (!signAndSend && simulated) {
    const { results } = simulated;
    if (!results || results[0] === undefined) {
      if (simulated.error) {
        console.log(simulated.error as unknown as string);
        return undefined;
      }
      console.log(`Invalid response from simulateTransaction:\n{simulated}`);
      return undefined;
    }

    return results[0];
  }

  if (!address) {
    throw new Error("Not connected to Freighter");
  }

  // is it possible for `auths` to be present but empty? Probably not, but let's be safe.
  const auths = simulated.results?.[0]?.auth;
  let auth_len = auths?.length ?? 0;

  if (auth_len > 1) {
    throw new NotImplementedError("Multiple auths not yet supported");
  } else if (auth_len == 1) {
    // TODO: figure out how to fix with new SorobanClient
    // const auth = SorobanClient.xdr.SorobanAuthorizationEntry.fromXDR(auths![0]!, 'base64')
    // if (auth.addressWithNonce() !== undefined) {
    //   throw new NotImplementedError(
    //     `This transaction needs to be signed by ${auth.addressWithNonce()
    //     }; Not yet supported`
    //   )
    // }
  }

  tx = await signTx(
    SorobanClient.assembleTransaction(tx, NETWORK_PASSPHRASE, simulated) as Tx,
  );

  const raw = await sendTx(tx);
  return {
    ...raw,
    xdr: raw.resultXdr!,
  };
}