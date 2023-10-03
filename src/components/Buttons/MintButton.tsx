import Button from "@mui/material/Button";
import { SorobanContextType } from "@soroban-react/core";
import { useContext, useState } from "react";

import BigNumber from "bignumber.js";
import { AppContext, SnackbarIconType } from "contexts";
import { sendNotification } from "functions/sendNotification";
import { TokenType } from "interfaces";
import * as SorobanClient from "soroban-client";
import { contractInvoke } from "utils/packages/contracts/src";
import { bigNumberToI128 } from "../../helpers/utils";
import { useKeys } from "../../hooks";

interface MintButtonProps {
  sorobanContext: SorobanContextType;
  token: TokenType;
  amountToMint: BigNumber;
}

export function MintButton({
  sorobanContext,
  token,
  amountToMint,
}: MintButtonProps) {
  const {SnackbarContext} = useContext(AppContext)
  const [isSubmitting, setSubmitting] = useState(false);
  const networkPassphrase = sorobanContext.activeChain?.networkPassphrase ?? "";
  const server = sorobanContext.server;
  const account = sorobanContext.address;
  const { admin_public, admin_secret } = useKeys(sorobanContext);

  const mintTokens = async () => {
    setSubmitting(true);

    //Parse amount to mint to BigNumber and then to i128 scVal
    const amountScVal = bigNumberToI128(amountToMint.shiftedBy(7));

    let adminSource, walletSource;

    try {
      adminSource = await server?.getAccount(admin_public);
    } catch (error) {
      alert("Your wallet or the token admin wallet might not be funded");
      setSubmitting(false);
      return;
    }

    const options = {
      secretKey: admin_secret,
      sorobanContext,

    };

    if (!account) {
      console.log("Error on account:", account)
      return
    }
    if (!adminSource) {
      console.log("Error on adminSource:", adminSource)
      return
    }
    console.log("🚀 ~ file: MintButton.tsx:70 ~ mintTokens ~ networkPassphrase:", networkPassphrase)
    console.log("🚀 ~ file: MintButton.tsx:68 ~ mintTokens ~ adminSource:", adminSource)
    console.log("🚀 ~ file: MintButton.tsx:72 ~ mintTokens ~ token.address:", token.address)
    console.log("🚀 ~ file: MintButton.tsx:75 ~ mintTokens ~ account:", account)


    try {

      // let tx = contractTransaction({
      //   source: adminSource,
      //   networkPassphrase,
      //   contractAddress: tokenId,
      //   method: "mint",
      //   args: [new SorobanClient.Address(account).toScVal(), amountScVal],
      // });
      // //Sends the transactions to the blockchain
      // let result = await sendTransaction(tx, options);

      let result = await contractInvoke({
        contractAddress: token.address,
        method: "mint",
        args: [new SorobanClient.Address(account).toScVal(), amountScVal],
        sorobanContext,
        signAndSend: true,
        secretKey: admin_secret
      })


      if (result) {
        sendNotification(`Minted ${amountToMint} ${token.symbol}`, "Minted", SnackbarIconType.MINT, SnackbarContext)
      }


      //This will connect again the wallet to fetch its data
      sorobanContext.connect();
    } catch (error) {
      console.log("🚀 « error: sendTransaction: ", error);
    }

    setSubmitting(false);
  };

  return (
    <Button variant="contained" onClick={mintTokens} disabled={isSubmitting}>
      Mint!
    </Button>
  );
}
