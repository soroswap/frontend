import React, {useState} from 'react';
import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import Button from '@mui/material/Button';


import * as SorobanClient from 'soroban-client'
import BigNumber from 'bignumber.js'
import { contractTransaction, useSendTransaction } from './useSendTransaction';
import {Constants} from '../../constants'
import { useFactory, useKeys } from '../../hooks';
import { accountToScVal, bigNumberToI128 } from '../../utils';

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
  const { admin_public, admin_secret } = useKeys(sorobanContext);

  const setTrustlineAndMint = async () => {
    setSubmitting(true)

    const bigNumberAmount = BigNumber(amountToMint)
    const amountScVal = bigNumberToI128(bigNumberAmount.shiftedBy(7))

    let adminSource, walletSource
    
    try{
      adminSource = await server?.getAccount(admin_public)
      walletSource = await server?.getAccount(account?? "")
    } catch(error){
      alert("Your wallet or the token admin wallet might not be funded")
      setSubmitting(false)  
      return
    }
      
    const options = {
      // secretKey: admin_secret,
      sorobanContext,
    }
    try {
      const contract = new SorobanClient.Contract(tokenId)
      const adminAccount = new SorobanClient.Account(admin_public ?? "", '0')
      // let tx = new SorobanClient.TransactionBuilder(adminSource, {
      //   fee: '1000',
      //   networkPassphrase
      // })
      // .addOperation(contract.call('mint', ...[accountToScVal(account), bigNumberToI128(bigNumberAmount)]))
      // .setTimeout(SorobanClient.TimeoutInfinite)
      // .build()


      let tx = contractTransaction({
        source: adminAccount,
        networkPassphrase,
        contractId: tokenId,
        method: 'mint',
        params: [new SorobanClient.Address(account).toScVal(), amountScVal]
      })
      console.log("🚀 « tx:", tx)
      let result = await sendTransaction(tx, options)
      console.log("🚀 « result:", result)
  

    } catch (error) {
      console.log("🚀 « error:", error)
    }


    
    setSubmitting(false)
  } // end of setTrustlineAndMint function


  return (
    <Button onClick={setTrustlineAndMint} disabled={isSubmitting} >
      Mint and create Trustline
    </Button>
  )
}
