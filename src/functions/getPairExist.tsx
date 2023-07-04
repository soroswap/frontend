import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import {
    accountToScVal,
  } from '../utils';


export function getPairExist(address_1:string, address_2:string, sorobanContext: SorobanContextType, factoryAddress:string) {
    let pairExist
    pairExist = useContractValue({
        contractId: factoryAddress,
        method: 'pair_exists',
        params: [accountToScVal(address_1), accountToScVal(address_2)],
        sorobanContext: sorobanContext
        })
    if ("error" in pairExist) {
        console.log(`pair exist error ${pairExist.error}`)
        return undefined
    }

   if (pairExist.result !== undefined) return pairExist.result!.value()
   else return undefined
    
}