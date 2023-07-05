import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import {
    accountToScVal,
  } from '../helpers/utils';
import { useFactory } from './useFactory';


export function usePairContractAddress(address_0:string, address_1:string, sorobanContext: SorobanContextType):boolean {
    let pairAddress_scval
    let pairAddress
    if (address_0 === address_1) return false

    const factory = useFactory(sorobanContext)

    pairAddress_scval = useContractValue({
        contractId: factory.factory_address,
        method: 'get_pair',
        params: [accountToScVal(address_0), accountToScVal(address_1)],
        sorobanContext: sorobanContext
        })
    
    console.log(pairAddress_scval)
    if (pairAddress_scval.result) {
        pairAddress = pairAddress_scval.result.value() as boolean
    } else return false
    return pairAddress
}