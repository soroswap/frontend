import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import * as SorobanClient from 'soroban-client';
import {
    accountToScVal,
    contractIdToScVal
  } from '../utils';



//   export function scvalToBool(value: SorobanClient.xdr.ScVal): string | undefined {
//     return value.value()
//   }
  

export function getPairExist(address_1:string, address_2:string, sorobanContext: SorobanContextType, factoryAddress:string) {

  const usePairExist = (): any => {
    return useContractValue({
        contractId: "f82441fa46d1fce97c87768626821dbd2c8600fc4521ea26b70d25a94c70bcae",
        method: 'pair_exists',
        params: [accountToScVal("CB4J5V4G4FCQASGABBGJSMP3PN2DETUTPHIIH7SNQHE5QJA3KQ37SURW"),
                accountToScVal("CDFYO4FTDI2YGVM2C6SNG2BJ5BTEEPOWPWFY4LN3CP5FLUVMZBHTANZ4")],
        //params: [contractIdToScVal(address_1), contractIdToScVal(address_2)]
        sorobanContext: sorobanContext
        })
  }

  let pairExist = usePairExist()

    console.log("pairExist: ", pairExist)
    if(pairExist.result){
        console.log("pairExist.result.value()", pairExist.result.value())

    }
    if ("error" in pairExist) {
        console.log(`pair exist error ${pairExist.error}`)
        return undefined
    }
    console.log(pairExist.result)
   if (pairExist.result !== undefined) return pairExist.result!.value()
   else return undefined
    
}