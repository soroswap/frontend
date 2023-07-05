import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import {
    accountToScVal,
  } from '../helpers/utils';
import { useFactory } from './useFactory';


export function usePairExist(address_0:string, address_1:string, sorobanContext: SorobanContextType):boolean {
    let pairExist_scval
    let pairExist
    if (address_0 === address_1) return false

    const factory = useFactory(sorobanContext)

    pairExist_scval = useContractValue({
        contractId: factory.factory_address,
        method: 'pair_exists',
        params: [accountToScVal(address_0), accountToScVal(address_1)],
        sorobanContext: sorobanContext
        })
    
    console.log(pairExist_scval)
    if (pairExist_scval.result) {
        pairExist = pairExist_scval.result.value() as boolean
    } else return false
    return pairExist
}