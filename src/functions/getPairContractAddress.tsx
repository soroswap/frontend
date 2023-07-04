import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import { getPairExist } from './getPairExist';
import {
  accountToScVal,
} from '../helpers/utils';

//Obtain from useFactory hook
let factoryAddress = "b490a625067ebcc5967c9e6ddaff924dee2fdd296b97b0f59497155f8f618f63"

export function getPairContractAddress(address_1:string, address_2:string, sorobanContext: SorobanContextType) {
  const usePairContractAddress= (): any => {
  return useContractValue({
    contractId: factoryAddress,
    method: 'get_pair',
    params: [accountToScVal(address_1), accountToScVal(address_2)],
    sorobanContext: sorobanContext
  })
}

let pairAddress = usePairContractAddress()

    if ("error" in pairAddress) {
        console.log(`pair exist error ${pairAddress.error}`)
        return false
    }
    
   if (pairAddress.result !== undefined) return pairAddress.result!.value()
   else return false

    
}