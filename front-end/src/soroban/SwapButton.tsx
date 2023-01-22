import React from 'react'
import {useSorobanReact } from "@soroban-react/core"
import Button from '@mui/material/Button';
import {useSendTransaction, contractTransaction} from '@soroban-react/contracts'
import {numberToU32} from '@soroban-react/utils'
import * as SorobanClient from 'soroban-client'
import addresses from './addresses.json'


interface SwapButtonProps {
    id: number,
}


export function SwapButton ({id}: SwapButtonProps){
    const sorobanContext =  useSorobanReact()
    const { sendTransaction } = useSendTransaction()
    const { activeChain, server, address } = sorobanContext
    
    
    const handleAdopt = async (): Promise<void> => {
        if (!activeChain || ! address || !server) {
            console.log("No active chain")
            return
        }
        else{
            try{
            let { sequence } = await server.getAccount(address)
            let source = new SorobanClient.Account(address, sequence)
    
            const transaction = contractTransaction({
                networkPassphrase: activeChain.networkPassphrase,
                source: source,
                contractId: addresses.pet_adopt_id,
                method: 'adopt',
                params: [numberToU32(id)]})

                const result = await sendTransaction(transaction, {sorobanContext})
                console.log("adoptPet.tsx:sendTransaction:result: ", result)
            }
            catch(error){
                console.log("Error while sending the transaction: ", error)

            }
        }

    }


    return(
        <Button
            size="small"
            variant="contained"
            onClick={handleAdopt}>
              Swap
          </Button>

    )
}