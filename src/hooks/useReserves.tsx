import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import BigNumber from 'bignumber.js';
import { scvalToBigNumber} from '../helpers/utils';


export function useReserves(pairAddress:string, sorobanContext: SorobanContextType):BigNumber {
    let reserves
    const reserves_scval = useContractValue({
        contractId: pairAddress,
        method: 'get_reserves',
        params: [],
        sorobanContext: sorobanContext
        })
    
    
    if (reserves_scval.result) {
        reserves = scvalToBigNumber(reserves_scval.result)
    } else return BigNumber(0)
    return reserves
}