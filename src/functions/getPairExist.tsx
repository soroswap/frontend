import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import {
    accountToScVal,
    contractIdToScVal
  } from '../utils';


export function getPairExist(address_1:string, address_2:string, sorobanContext: SorobanContextType, factoryAddress:string) {
    let pairExist
    pairExist = useContractValue({
        contractId: factoryAddress,
        method: 'pair_exists',
        params: [accountToScVal(address_1), accountToScVal(address_2)],
        //params: [contractIdToScVal(address_1), contractIdToScVal(address_2)],
        sorobanContext: sorobanContext
        })
    if ("error" in pairExist) {
        console.log(`pair exist error ${pairExist.error}`)
        return undefined
    }
    console.log(pairExist.result)
   if (pairExist.result !== undefined) return pairExist.result!.value()
   else return undefined
    
}