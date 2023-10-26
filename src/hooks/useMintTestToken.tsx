import { contractInvoke } from "@soroban-react/contracts";
import { useSorobanReact } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { AppContext, SnackbarIconType } from "contexts";
import { sendNotification } from "functions/sendNotification";
import { bigNumberToI128 } from "helpers/utils";
import { useKeys, useTokens } from "hooks";
import { useCallback, useContext } from "react";
import * as SorobanClient from 'soroban-client';

export function useMintTestToken() {
  const sorobanContext = useSorobanReact()
  const { admin_public, admin_secret } = useKeys(sorobanContext);
  const tokens = useTokens(sorobanContext);
  const {SnackbarContext} = useContext(AppContext)
  
  return useCallback(async () => {
    const server = sorobanContext.server;
    const account = sorobanContext.address;
    
    const amountScVal = bigNumberToI128(BigNumber(2500000).shiftedBy(7));
    let adminSource;
    
    try {
      adminSource = await server?.getAccount(admin_public);
    } catch (error) {
      alert("Your wallet or the token admin wallet might not be funded");
      return;
    }

    if (!account) {
      console.log("Error on account:", account)
      return
    }
    if (!adminSource) {
      console.log("Error on adminSource:", adminSource)
      return
    }

    console.log("🚀 « tokens:", tokens)
    let result
    for (let index = 0; index < 4; index++) {
      const token = tokens[index];
      console.log(token)
      
      try {
        result = await contractInvoke({
          contractAddress: token.address,
          method: "mint",
          args: [new SorobanClient.Address(account).toScVal(), amountScVal],
          sorobanContext,
          signAndSend: true,
          secretKey: admin_secret
        })
      } catch (error) {
        console.log("🚀 « error: sendTransaction: ", error);
      }   
    }
    
    if (result) {
      sendNotification(`Minted 4 test tokens`, "Minted", SnackbarIconType.MINT, SnackbarContext)
    }

    sorobanContext.connect();
  }, [SnackbarContext, admin_public, admin_secret, sorobanContext, tokens])
}