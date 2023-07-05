import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import {
    accountToScVal,
  } from '../helpers/utils';
import { useFactory } from './useFactory';
import { xdr } from 'soroban-client';


export function usePairContractAddress(address_0:string, address_1:string, sorobanContext: SorobanContextType):string|null{
    let pairAddress
    let params: xdr.ScVal[] = []
    try {
        params = [accountToScVal(address_0), accountToScVal(address_1)]
    } catch (error) { 
    }
    const factory = useFactory(sorobanContext)
    const pairAddress_scval = useContractValue({
        contractId: factory.factory_address,
        method: 'get_pair',
        params: params,
        sorobanContext: sorobanContext
        })
    
    console.log(pairAddress_scval)
    if (pairAddress_scval.result) {
        pairAddress = pairAddress_scval.result.value() as string
    } else return null
    return pairAddress
}