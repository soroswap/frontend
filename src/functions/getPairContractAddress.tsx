import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import { getPairExist } from './getPairExist';
import {
  accountToScVal,
} from '../utils';

//Obtain from useFactory hook
let factoryAddress = "8d0f997313172042583e3debfeb150cbf2ec9d567c0a82ca4b2a52b2fd7d6ea8"

export function getPairContractAddress(address_1:string, address_2:string, sorobanContext: SorobanContextType) {

  switch (getPairExist(address_1, address_2, sorobanContext, factoryAddress)) {
    case false:
      return "pair does not exist"

    case undefined:
      return "pair undefined"
  }
  let pairAddress

//   pairAddress = useContractValue({
//     contractId: factoryAddress,
//     method: 'get_pair',
//     params: [accountToScVal(address_1), accountToScVal(address_2)],
//     sorobanContext: sorobanContext
//   })
//   if ("error" in pairAddress) {
//     console.log(`pair address error ${pairAddress.error}`)
// }


//   if (pairAddress !== undefined) {
//     return pairAddress.result
//   }
    
}