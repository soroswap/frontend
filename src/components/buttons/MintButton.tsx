import React, {useState} from 'react';
import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import Button from '@mui/material/Button';


import * as SorobanClient from 'soroban-client'
import BigNumber from 'bignumber.js'
import {useSendTransaction, setTrustline} from '@soroban-react/contracts'
import {Constants} from '../../constants'

export function MintButton({
    sorobanContext,
    tokenId,
    tokenSymbol,
    amountToMint     
    }:{
      sorobanContext: SorobanContextType,
      tokenId: string,
      tokenSymbol: string,
      amountToMint: BigNumber
      }){
const [isSubmitting, setSubmitting] = useState(false)
const networkPassphrase = sorobanContext.activeChain?.networkPassphrase ?? ''
const { sendTransaction } = useSendTransaction()
const setTrustlineAndMint = async () => {
setSubmitting(true)
const server = sorobanContext.server
const account = sorobanContext.address
if (!server) throw new Error("Not connected to server")
if (!account) throw new Error("Not connected to server")

let { sequence, balances } = await server.getAccount(Constants.TokenAdmin)
      let adminSource = new SorobanClient.Account(Constants.TokenAdmin, sequence)

      let wallet = await server.getAccount(account)
      let walletSource = new SorobanClient.Account(wallet.id, wallet.sequence)

      //
      // 1. Establish a trustline to the admin (if necessary)
      // 2. The admin sends us money (mint)
      //
      // We have to do this in two separate transactions because one
      // requires approval from Freighter while the other can be done with
      // the stored token issuer's secret key.
      //
      // FIXME: The `getAccount()` RPC endpoint doesn't return `balances`,
      //        so we never know whether or not the user needs a trustline
      //        to receive the minted asset.
      //
      // Today, we establish the trustline unconditionally.
      //

      if (!balances || balances.filter(b => (
        b.asset_code == tokenSymbol && b.asset_issuer == Constants.TokenAdmin
      )).length === 0) {
        try {

          
          

          let trustlineResult = await setTrustline({
            tokenSymbol: tokenSymbol,
            tokenAdmin: Constants.TokenAdmin,
            account: account,
            sorobanContext: sorobanContext,
            sendTransaction: sendTransaction
          })
        } catch (err) {
          console.error(err)
          console.log("error while creating trustline")
        }
      }
      

      try {
        const paymentResult = await sendTransaction(
          new SorobanClient.TransactionBuilder(adminSource, { 
            networkPassphrase,
            fee: "1000",
          })
          .setTimeout(10)
          .addOperation(
            SorobanClient.Operation.payment({
              destination: wallet.id,
              asset: new SorobanClient.Asset(tokenSymbol, Constants.TokenAdmin),
              amount: amountToMint.toString(),
            })
          )
          .build(), {
            timeout: 10 * 1000,
            skipAddingFootprint: true,
            secretKey: Constants.TokenAdminSecretKey,
            sorobanContext
          }
        )
        console.debug(paymentResult)
        console.log("paymentResult: ", paymentResult)
      } catch (err) {
        console.error(err)
        console.log("error while minting")
      }
      //
      // TODO: Show some user feedback while we are awaiting, and then based
      // on the result
      //
      setSubmitting(false)
} // end of setTrustlineAndMint function

return(
<Button
  onClick={setTrustlineAndMint}
  disabled={isSubmitting}
>Mint and create Trustline</Button>
)

}
