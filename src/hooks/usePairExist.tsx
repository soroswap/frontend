import {SorobanContextType} from '@soroban-react/core';
import {useContractValue} from '@soroban-react/contracts'
import {
    accountToScVal,
  } from '../helpers/utils';
import { useFactory } from './useFactory';


export function usePairExist(token_address_0:string, token_address_1:string, sorobanContext: SorobanContextType):boolean {
    if (!token_address_0) throw ("No token_address_0")
    if (!token_address_1) throw ("No token_address_1")
    if (!sorobanContext) throw ("No sorobanContext")
    if (token_address_0 === token_address_1) throw("usePairExist: token_address_0 and token_address_1 should be different")

    let pairExist

    const factory = {
        factory_id:	"478f707d8dfaffce86a898f70b711af4dbfb1d02a08562be0d5e6d448a892d5c",
        factory_address:	"CBDY64D5RX5P7TUGVCMPOC3RDL2NX6Y5AKQIKYV6BVPG2REKREWVYLOK"
    }
    //let pairExist_scval
    console.log("🚀 ~ file: usePairExist.tsx:25 ~ usePairExist ~ factory.factory_address:", factory.factory_address)
    console.log("🚀 ~ file: usePairExist.tsx:28 ~ usePairExist ~ accountToScVal(token_address_0):", accountToScVal(token_address_0))
    console.log("🚀 ~ file: usePairExist.tsx:29 ~ usePairExist ~ accountToScVal(token_address_1):", accountToScVal(token_address_1))
    console.log("🚀 ~ file: usePairExist.tsx:31 ~ usePairExist ~ sorobanContext:", sorobanContext)
    
    // const pairExist_scval = useContractValue({
    //     contractId: factory.factory_address,
    //     method: 'pair_exists',
    //     params: [accountToScVal(token_address_0), accountToScVal(token_address_1)],
    //     sorobanContext: sorobanContext
    //     })
        
    // if (!pairExist_scval) throw("Error while trying to get pairExist_scval")
    // if (pairExist_scval.result) {
    //     pairExist = pairExist_scval.result.value() as boolean
    //     return pairExist
    // }
    // else {
    //     console.log("There was an error in usePairExist. Got result ", pairExist_scval)
    //     throw("There was an error in usePairExist")
    // }

    return false
}