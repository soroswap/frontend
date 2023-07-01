import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import { scvalToBigNumber } from '@soroban-react/utils';
import { xdr } from 'soroban-client';

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