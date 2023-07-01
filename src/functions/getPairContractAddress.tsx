import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import { accountIdentifier, contractIdentifier } from '@soroban-react/utils';
import * as SorobanClient from 'soroban-client'
import { Constants } from '../constants';


//Obtain from useFactory hook
let factoryAddress = "09b7ab4b4e7bf42d30bed14c60bb2662a26e627b0ffd6926d8ab4ba4e0660709"

export function getPairContractAddress(address_1:string, address_2:string, sorobanContext: SorobanContextType) {
    let pairAddress

    pairAddress = useContractValue({
        contractId: factoryAddress,
        method: 'get_pair',
        params: [contractIdentifier(address_1), contractIdentifier(address_2)],
        sorobanContext: sorobanContext
      })


    console.log(`pair address error ${pairAddress.error}`)
    return pairAddress.result
    
}