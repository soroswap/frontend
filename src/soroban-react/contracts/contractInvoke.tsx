import * as SorobanClient from 'soroban-client'
import { SorobanContextType } from '@soroban-react/core'
import type {Transaction, Tx} from './types'
import { signAndSendTransaction } from './transaction'
import { contractTransaction } from './contractTransaction'
let xdr = SorobanClient.xdr 


export type InvokeArgs = {
  contractAddress: string
  method: string;
  args?: SorobanClient.xdr.ScVal[] | undefined
  signAndSend?: boolean; 
  fee?: number;
  skipAddingFootprint?: boolean;
  secretKey?: string;
  sorobanContext: SorobanContextType
  };

// Dummy source account for simulation. The public key for this is all 0-bytes.
const defaultAddress =
  'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'

export async function contractInvoke({
    contractAddress,
    method,
    args = [],
    signAndSend = false,
    fee = 100,
    skipAddingFootprint,
    secretKey,
    sorobanContext,
  }: InvokeArgs) {
    const { server, address, activeChain } = sorobanContext;
    
    if(!activeChain){throw new Error('No active Chain')}
    if(!server){throw new Error('No connected to a Server')}
    if(signAndSend && !secretKey && !sorobanContext.activeConnector){
      throw new Error("contractInvoke: You are trying to sign a txn without providing a source, secretKey or active connector")
    }
    
    const networkPassphrase = activeChain?.networkPassphrase
    const source = secretKey
    ? await server.getAccount(SorobanClient.Keypair.fromSecret(secretKey).publicKey())
    : address
      ? await server?.getAccount(address)
      : new SorobanClient.Account(defaultAddress, "0");   

    //Builds the transaction
    let txn = contractTransaction({
      source,
      networkPassphrase,
      contractAddress,
      method,
      args,
    });
    console.log("🚀 ~ file: contractInvoke.tsx:57 ~ txn:", txn)
    
    const simulated = await server?.simulateTransaction(txn);
    console.log("🚀 ~ file: contractInvoke.tsx:59 ~ simulated:", simulated)
    if (!signAndSend && simulated) {
      const { results } = simulated;
      console.log("🚀 ~ file: contractInvoke.tsx:61 ~ results:", results)
      if (!results || results[0] === undefined) {
        if (simulated.error) {
          console.log(simulated.error as unknown as string);
          return undefined;
        }
        console.log(`Invalid response from simulateTransaction:\n{simulated}`);
        return undefined;
      } 
      
      return xdr.ScVal.fromXDR(results[0].xdr, 'base64');
    }
    else {
      // If signAndSend
      return await signAndSendTransaction({txn,skipAddingFootprint, secretKey,sorobanContext});
    }
  }