import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import { accountIdentifier, contractIdentifier } from '@soroban-react/utils';
import * as SorobanClient from 'soroban-client'
import { Constants } from '../constants';


//Obtain from useFactory hook
let factoryAddress = "8d0f997313172042583e3debfeb150cbf2ec9d567c0a82ca4b2a52b2fd7d6ea8"

export function getPairContractAddress(address_1:string, address_2:string, sorobanContext: SorobanContextType) {
    let pairAddress

    pairAddress = useContractValue({
        contractId: factoryAddress,
        method: 'pair_exists',
        params: [contractIdentifier(address_1), contractIdentifier(address_2)],
        sorobanContext: sorobanContext
      })


    console.log(`pair address error ${pairAddress.error}`)
    return pairAddress.result
    
}