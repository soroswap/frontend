import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import * as SorobanClient from 'soroban-client';
import {
    accountToScVal,
    contractIdToScVal
  } from '../helpers/utils';
import getContractValue from './getContractvalue';


export async function getPairExist(address_1:string, address_2:string, factoryAddress:string, sorobanContext: SorobanContextType) {
    const usePairExist = async (): Promise<any> => {
        return getContractValue({
            contractId: factoryAddress,
            method: 'pair_exists',
            params: [accountToScVal(address_1), accountToScVal(address_2)],
            sorobanContext: sorobanContext
            })
        }
    
    let pairExist = await usePairExist()

    if ("error" in pairExist) {
        console.log(`pair exist error ${pairExist.error}`)
        return false
    }
    
   if (pairExist.result !== undefined) return pairExist.result!.value()
   else return false
    
}