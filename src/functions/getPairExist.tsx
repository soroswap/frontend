import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import { accountIdentifier, contractIdentifier } from '@soroban-react/utils';
import * as SorobanClient from 'soroban-client'
import { Constants } from '../constants';


export function getPairExist(address_1:string, address_2:string, sorobanContext: SorobanContextType, factoryAddress:string) {
    let pairExist
    pairExist = useContractValue({
        contractId: factoryAddress,
        method: 'pair_exists',
        params: [contractIdentifier(address_1), contractIdentifier(address_2)],
        sorobanContext: sorobanContext
        })
    if ("error" in pairExist) {
        console.log(`pair exist error ${pairExist.error}`)
    }

   if (pairExist !== undefined) return pairExist.result
   else return undefined
    
}