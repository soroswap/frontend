import * as SorobanClient from 'soroban-client'
import { SorobanContextType } from '@soroban-react/core'
import type {Transaction, Tx} from './types'
import { signAndSendTransaction } from './transaction'

export type InvokeArgs = {
    contractAddress: string
    method: string;
    args?: SorobanClient.xdr.ScVal[] | undefined
    sorobanContext: SorobanContextType
    fee?: number;
    signAndSend?: boolean;
    secretKey?: string;
    source?: SorobanClient.Account
    skipAddingFootprint?: bool
  };

// Dummy source account for simulation. The public key for this is all 0-bytes.
const defaultAddress =
  'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'

export async function contractInvoke({
    contractAddress,
    method,
    args = [],
    sorobanContext,
    fee = 100,
    signAndSend = false,
    source,
    secretKey,
    skipAddingFootprint
  }: InvokeArgs) {
    const { server, address, activeChain } = sorobanContext;
    if(!activeChain){
        throw new Error('No active Chain')
    }
    if(!server){
        throw new Error('No connected to a Server')
    }
  
    // use a placeholder account if not yet connected to the Connector so that view calls can still work
    source = source ??
    await server?.getAccount(address?? "") ??
    new SorobanClient.Account(
      defaultAddress,
      "0",
      );
      
    const contract = new SorobanClient.Contract(contractAddress);
  
    let txn = new SorobanClient.TransactionBuilder(source, {
      fee: fee.toString(10),
      networkPassphrase: activeChain?.networkPassphrase,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(SorobanClient.TimeoutInfinite)
      .build();
  
    const simulated = await server?.simulateTransaction(txn);
  
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
    else {

      // preflight and add the footprint
      if (!skipAddingFootprint) {
        txn = await server.prepareTransaction(txn, activeChain?.networkPassphrase) as Tx
        if (!txn) {
          throw new Error('No transaction after adding footprint')
        }
      }

      return await signAndSendTransaction({txn,secretKey,sorobanContext});
    }
  }