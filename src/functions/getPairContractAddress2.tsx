import {SorobanContextType} from '@soroban-react/core';
import { contractIdentifier } from '@soroban-react/utils';
import * as SorobanClient from 'soroban-client'
import { Constants } from '../constants';


//Obtain from useFactory hook
let factoryAddress = "09b7ab4b4e7bf42d30bed14c60bb2662a26e627b0ffd6926d8ab4ba4e0660709"

export async function getPairContractAddress2(address_1:string, address_2:string, sorobanContext: SorobanContextType) {
    const server = sorobanContext.server
    if (server == null) return;
    const networkPassphrase = sorobanContext.activeChain?.networkPassphrase ?? ''
    let adminSource = new SorobanClient.Account(Constants.TokenAdmin, "0")
    const contract = new SorobanClient.Contract(factoryAddress)

    let txn = new SorobanClient.TransactionBuilder(adminSource, { fee: "1000", networkPassphrase: networkPassphrase })
    .addOperation(
        contract.call("get_pair", ...[contractIdentifier(address_1), contractIdentifier(address_2)])
    ).setTimeout(30)
    .build();

    let transactionResult
    let network
    try {
        //txn = await server.prepareTransaction(txn);
        //const { results } = await server.simulateTransaction(txn);
        network = await server.getNetwork();
        //transactionResult = await server.sendTransaction(txn);
    } catch (e) {
        console.log(e)
    }

    return network
}