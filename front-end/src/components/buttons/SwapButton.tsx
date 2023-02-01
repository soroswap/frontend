import React from 'react'
import {useSorobanReact } from "@soroban-react/core"
import Button from '@mui/material/Button';
import {useSendTransaction, contractTransaction} from '@soroban-react/contracts'
import * as SorobanClient from 'soroban-client'
import { currencies } from '../../currencies';
import { Constants } from '../../constants';
import {bigNumberToI128, invoker, accountIdentifier, contractIdentifier} from "@soroban-react/utils"
import BigNumber from 'bignumber.js'


interface SwapButtonProps {
    outputToken: { value: string; label: string; shortlabel: string; id: number; symbol: string; }
    outputTokenAmount: number,
    inputTokenAmount: number
}


export function SwapButton (
                {outputToken,
                outputTokenAmount,
                inputTokenAmount}: SwapButtonProps){
                    console.log("outputToken: ", outputToken)
                    console.log("outputTokenAmount: ", outputTokenAmount)
    const sorobanContext =  useSorobanReact()
    const { sendTransaction } = useSendTransaction()
    const { activeChain, server, address } = sorobanContext
    
    const handleSwap = async (): Promise<void> => {
        if (!activeChain || ! address || !server) {
            console.log("No active chain")
            return
        }
        else{
            try{
            let { sequence } = await server.getAccount(address)
            let source = new SorobanClient.Account(address, sequence)
            
            console.log("creating 1st tx to sign")
            
            
            const nonce = bigNumberToI128(BigNumber(0))
            
            let result1
            if (outputToken == currencies[1]){
            result1 = await sendTransaction(
                contractTransaction({
                    networkPassphrase: activeChain.networkPassphrase,
                    source: source,
                    contractId: Constants.TokenId_1,
                    method: 'xfer',
                    params: [invoker, nonce, contractIdentifier(Constants.LiquidityPoolId), bigNumberToI128(BigNumber(inputTokenAmount).shiftedBy(7))]
                }), {sorobanContext})

            }
            else{
                result1 = await sendTransaction( contractTransaction({
                    networkPassphrase: activeChain.networkPassphrase,
                    source: source,
                    contractId: Constants.TokenId_2,
                    method: 'xfer',
                    params: [invoker, nonce, contractIdentifier(Constants.LiquidityPoolId), bigNumberToI128(BigNumber(inputTokenAmount).shiftedBy(7))]
                }), {sorobanContext})


            }
            
                console.log("result1: ", result1)
                
            let transaction
            if (outputToken == currencies[1]){
                transaction = contractTransaction({
                    networkPassphrase: activeChain.networkPassphrase,
                    source: source,
                    contractId: Constants.LiquidityPoolId,
                    method: 'swap',
                    params: [accountIdentifier(address), bigNumberToI128(BigNumber(0)), bigNumberToI128(BigNumber(outputTokenAmount).shiftedBy(7))]})
    
            }
            else{

                transaction = contractTransaction({
                    networkPassphrase: activeChain.networkPassphrase,
                    source: source,
                    contractId: Constants.LiquidityPoolId,
                    method: 'swap',
                    params: [accountIdentifier(address), bigNumberToI128(BigNumber(outputTokenAmount).shiftedBy(7)), bigNumberToI128(BigNumber(0))]})

            }
                console.log("Sending swap transaction")
                const result = await sendTransaction(transaction, {sorobanContext})
                console.log("swap:sendTransaction:result: ", result)
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
            onClick={handleSwap}>
              Swap
          </Button>

    )
}