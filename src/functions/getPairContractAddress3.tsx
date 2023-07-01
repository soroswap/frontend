import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import { accountIdentifier, contractIdentifier } from '@soroban-react/utils';
import * as SorobanClient from 'soroban-client'
import { Constants } from '../constants';
import {useSendTransaction, } from '@soroban-react/contracts'


//Obtain from useFactory hook
let factoryAddress = "09b7ab4b4e7bf42d30bed14c60bb2662a26e627b0ffd6926d8ab4ba4e0660709"

export async function getPairContractAddress2(address_1:string, address_2:string, sorobanContext: SorobanContextType) {
    const server = sorobanContext.server
    const { sendTransaction } = useSendTransaction()
    if (server == null) return;
    const networkPassphrase = sorobanContext.activeChain?.networkPassphrase ?? ''
    let adminSource = new SorobanClient.Account(Constants.TokenAdmin, "0")
    const contract = new SorobanClient.Contract(factoryAddress);

        const paymentResult = await sendTransaction(
            new SorobanClient.TransactionBuilder(adminSource, { 
              networkPassphrase,
              fee: "1000",
            })
            .setTimeout(10)
            .addOperation(
                contract.call("get_pair", ...[contractIdentifier(address_1), contractIdentifier(address_2)]),
            )
            .build(), {
                secretKey: Constants.TokenAdminSecretKey,
                sorobanContext
              }
          )
        
        let result = server.simulateTransaction(paymentResult)



    return result
    
}