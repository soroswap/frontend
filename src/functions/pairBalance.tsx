import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import { xdr } from 'soroban-client';
import {
  scvalToBigNumber,
} from '../helpers/utils';

export function getPairBalance(pairAddress:string, user:xdr.ScVal, sorobanContext: SorobanContextType) {
    let userBalance

    userBalance = useContractValue({
        contractId: pairAddress,
        method: 'balance',
        params: [user],
        sorobanContext: sorobanContext
      })
           
    return scvalToBigNumber(userBalance.result)
    
}