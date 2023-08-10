import * as SorobanClient from 'soroban-client'



export interface contractTransactionProps {
    networkPassphrase: string
    source: SorobanClient.Account
    contractId: string
    method: string
    params?: SorobanClient.xdr.ScVal[]
  }
  
  export function contractTransaction({
    networkPassphrase,
    source,
    contractId,
    method,
    params,
  }: contractTransactionProps): SorobanClient.Transaction {
    let myParams: SorobanClient.xdr.ScVal[] = params || []
    const contract = new SorobanClient.Contract(contractId)
    return new SorobanClient.TransactionBuilder(source, {
      // TODO: Figure out the fee
      fee: '100',
      networkPassphrase,
    })
      .addOperation(contract.call(method, ...myParams))
      .setTimeout(SorobanClient.TimeoutInfinite)
      .build()
  }
  