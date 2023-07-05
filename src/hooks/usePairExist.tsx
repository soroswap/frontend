import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import {
    accountToScVal,
  } from '../helpers/utils';
import { useFactory } from './useFactory';


export function usePairExist(token_address_0:string, token_address_1:string, sorobanContext: SorobanContextType):boolean {
    let pairExist
    if (token_address_0 === token_address_1) return false

    const factory = useFactory(sorobanContext)
    if (!factory) return false
    const pairExist_scval = useContractValue({
        contractId: factory.factory_address,
        method: 'pair_exists',
        params: [accountToScVal(token_address_0), accountToScVal(token_address_1)],
        sorobanContext: sorobanContext
        })
    
    console.log(pairExist_scval)
    if (pairExist_scval.result) {
        pairExist = pairExist_scval.result.value() as boolean
    } else return false
    return pairExist
}