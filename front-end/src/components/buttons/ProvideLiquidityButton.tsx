import React from 'react'
import {useSorobanReact } from "@soroban-react/core"
import Button from '@mui/material/Button';
import {useSendTransaction, contractTransaction, useContractValue} from '@soroban-react/contracts'
import {scvalToString} from '@soroban-react/utils'
import {bigNumberToI128} from '@soroban-react/utils'
import * as SorobanClient from 'soroban-client'
import BigNumber from 'bignumber.js'
let xdr = SorobanClient.xdr


import {Constants} from '../../constants'
import { MemoText } from 'soroban-client';
import { accountIdentifier, contractIdentifier } from '../../identifiers';
import { setTrustline } from '../../setTrustline';

interface ProvideLiquidityProps {
    inputTokenAmount_1: number,
    inputTokenAmount_2: number
}


export function ProvideLiquidityButton (
    { 
        inputTokenAmount_1,
        inputTokenAmount_2} :
        ProvideLiquidityProps){
    const sorobanContext =  useSorobanReact()
    const { sendTransaction } = useSendTransaction()
    const { activeChain, server, address, activeWallet } = sorobanContext
    const networkPassphrase = sorobanContext.activeChain?.networkPassphrase ?? ''
    const liquidityPoolId = Constants.LiquidityPoolId
    const share_pool_id_scval = useContractValue({
        contractId: liquidityPoolId,
        method: 'share_id',
        sorobanContext: sorobanContext
      })
    
    const handleProvideLiquidity = async (): Promise<void> => {

        if (!server) throw new Error("Not connected to server")
        if (!networkPassphrase) throw new Error("No networkPassphrase")
        if (!activeWallet) throw new Error("No activeWallet")
        if (!activeChain || ! address || !server) {
            console.log("No active chain")
            return
        }
        else{
            try{

                



                // try{
                //     "need to know that is the share "

                //     const trustlineResult = await sendTransaction(
                //         contractTransaction({
                //             networkPassphrase: activeChain.networkPassphrase,
                //             source: source,
                //             contractId: Constants.TokenId_1,
                //             method: 'xfer',
                //             params: [invoker, nonce, contractIdentifier(liquidityPoolId), bigNumberToI128(BigNumber(inputTokenAmount_1).shiftedBy(7))]
                //         }), {sorobanContext})
                //     console.log("trustlineResult: ", trustlineResult)
                // }
                // catch(error){
                //     console.log("new error: ", error)
                // }
                // console.log("Setting trustilne for pool token")
            
          
            


            let { sequence } = await server.getAccount(address)
            let source = new SorobanClient.Account(address, sequence)
            console.log("handleProvideLiquidity: Transfering the 1st token")
            const invoker = xdr.ScVal.scvObject(
                xdr.ScObject.scoVec([xdr.ScVal.scvSymbol('Invoker')])
            )
            
            const nonce = bigNumberToI128(BigNumber(0))

            console.log("invoker: ", invoker)
            console.log("nonce: ", nonce)
            console.log("contractIdentifier(liquidityPoolId): ", contractIdentifier(liquidityPoolId))
            console.log("bigNumberToI128(BigNumber(inputTokenAmount_1)): ", bigNumberToI128(BigNumber(inputTokenAmount_1)))
            


            


            console.log("creating 1st tx to sign")
            
            console.log("inputTokenAmount_1: ", inputTokenAmount_1)
            console.log("inputTokenAmount_2: ", inputTokenAmount_2)

            const result1 = await sendTransaction(
                contractTransaction({
                    networkPassphrase: activeChain.networkPassphrase,
                    source: source,
                    contractId: Constants.TokenId_1,
                    method: 'xfer',
                    params: [invoker, nonce, contractIdentifier(liquidityPoolId), bigNumberToI128(BigNumber(inputTokenAmount_1).shiftedBy(7))]
                }), {sorobanContext})
            console.log("result1: ", result1)

            console.log("creating 2nd tx to sign")

            const result2 = await sendTransaction(
                contractTransaction({
                    networkPassphrase: activeChain.networkPassphrase,
                    source: source,
                    contractId: Constants.TokenId_2,
                    method: 'xfer',
                    params: [invoker, nonce, contractIdentifier(liquidityPoolId), bigNumberToI128(BigNumber(inputTokenAmount_2).shiftedBy(7))]
                }), {sorobanContext})
            console.log("result2: ", result2)

            
        
            console.log("Invoking deposit in pool")

            console.log("creating 3nd tx to sign")

            const transaction3 = contractTransaction({
                networkPassphrase: activeChain.networkPassphrase,
                source: source,
                contractId: liquidityPoolId,
                method: 'deposit',
               // params: [accountIdentifier(address)]
            })

            console.log("sending to user to sign")
            
            const result3 = await sendTransaction(
                transaction3, {timeout: 10 * 1000,
                skipAddingFootprint: true,
                sorobanContext})
            console.log("result3: ", result3)



           

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
            onClick={handleProvideLiquidity}>
              Provide Liquidity
          </Button>

    )
}