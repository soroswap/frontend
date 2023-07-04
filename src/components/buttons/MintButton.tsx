import React, {useState} from 'react';
import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import Button from '@mui/material/Button';


import * as SorobanClient from 'soroban-client'
import BigNumber from 'bignumber.js'
import {useSendTransaction, setTrustline} from '@soroban-react/contracts'
import {Constants} from '../../constants'
import { useKeys } from '../../hooks';

interface MintButtonProps {
  sorobanContext: SorobanContextType,
  tokenId: string,
  tokenSymbol: string,
  amountToMint: BigNumber
}

export function MintButton({
  sorobanContext,
  tokenId,
  tokenSymbol,
  amountToMint     
}: MintButtonProps) {
  const [isSubmitting, setSubmitting] = useState(false)
  const networkPassphrase = sorobanContext.activeChain?.networkPassphrase ?? ''
  const server = sorobanContext.server
  const account = sorobanContext.address
  const { sendTransaction } = useSendTransaction()
  const {admin_public, admin_secret} = useKeys(sorobanContext);

  const setTrustlineAndMint = async () => {
    setSubmitting(true)
    
  let adminSource, walletSource
  try{
    adminSource = await server?.getAccount(admin_public)
    walletSource = await server?.getAccount(account?? "")
  }
  catch(error){
    alert("Your wallet or the token admin wallet might not be funded")
    setSubmitting(false)  
    return
  }
  console.log("🚀 « walletSource:", walletSource)
  console.log("🚀 « adminSource:", adminSource)
    
  // try {
  //   console.log("Establishing the trustline...")
  //   console.log("sorobanContext: ", sorobanContext)
  //   const trustlineResult = await sendTransaction(
  //     new SorobanClient.TransactionBuilder(walletSource, {
  //       networkPassphrase,
  //       fee: "1000", // arbitrary
  //     })
  //     .setTimeout(60)
  //     .addOperation(
  //       SorobanClient.Operation.changeTrust({
  //         asset: new SorobanClient.Asset(tokenSymbol, admin_public),
  //       })
  //     )
  //     .build(), {
  //       timeout: 60 * 1000, // should be enough time to approve the tx
  //       skipAddingFootprint: true, // classic = no footprint
  //       // omit `secretKey` to have Freighter prompt for signing
  //       // hence, we need to explicit the sorobanContext
  //       sorobanContext
  //     },
  //   )
  //   console.debug(trustlineResult)
  // } catch (err) {
  //   console.log("Error while establishing the trustline: ", err)
  //   console.error(err)
  // }
    
  try {
    console.log("Minting the token...")
    let paymentResult = await sendTransaction(
      new SorobanClient.TransactionBuilder(adminSource, {
        networkPassphrase,
        fee: "1000",
      })
      .setTimeout(1000)
      .addOperation(
        SorobanClient.Operation.payment({
          amount: amountToMint.toString(),
          asset: new SorobanClient.Asset(tokenSymbol, admin_public),
          destination: walletSource.accountId(),
        })
      )
      .build(), {
        timeout: 10 * 1000,
        skipAddingFootprint: true,
        secretKey: admin_secret,
        sorobanContext
      }
    )
    // if (true) {
    //   // Simulate the tx to discover the storage footprint, and update the
    //   // tx to include it. If you already know the storage footprint you
    //   // can use `addFootprint` to add it yourself, skipping this step.
    //   paymentResult = await server?.prepareTransaction(paymentResult, networkPassphrase)
    //   console.log("🚀 « paymentResult:", paymentResult)
  
    //   // // sign with Freighter
    //   // const signed = await signTransaction(tx.toXDR(), {
    //   //   network: window.freighterNetwork.network,
    //   //   networkPassphrase: window.freighterNetwork.networkPassphrase,
    //   // })
  
    //   // // re-assemble with signed tx
    //   // tx = SorobanClient.TransactionBuilder.fromXDR(
    //   //   signed,
    //   //   window.freighterNetwork.networkPassphrase
    //   // ) as Tx
  
    //   // return await server.sendTransaction(tx);
    // }
  
    // const { results } = await server.simulateTransaction(tx)
    // if (!results || results[0] === undefined) {
    //     throw new Error("Invalid response from simulateTransaction")
    // }
    console.debug(paymentResult)
    sorobanContext.connect()
  } catch (err) {
    console.log("Error while minting the token: ", err)
    console.error(err)
  }

    setSubmitting(false)
  } // end of setTrustlineAndMint function


  return (
    <Button onClick={setTrustlineAndMint} disabled={isSubmitting} >
      Mint and create Trustline
    </Button>
  )
}
