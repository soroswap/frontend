import React, { useState } from "react";
import { SorobanContextType } from "@soroban-react/core";
import Button from "@mui/material/Button";

import * as SorobanClient from "soroban-client";
import BigNumber from "bignumber.js";
import {
  contractTransaction,
  useSendTransaction,
} from "@soroban-react/contracts";
import { useKeys } from "../../hooks";
import { bigNumberToI128 } from "../../helpers/utils";

interface MintButtonProps {
  sorobanContext: SorobanContextType;
  tokenId: string;
  amountToMint: BigNumber;
}

export function MintButton({
  sorobanContext,
  tokenId,
  amountToMint,
}: MintButtonProps) {
  const [isSubmitting, setSubmitting] = useState(false);
  const networkPassphrase = sorobanContext.activeChain?.networkPassphrase ?? "";
  const server = sorobanContext.server;
  const account = sorobanContext.address;
  const { sendTransaction } = useSendTransaction();
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

    try {
      //Builds the transaction
      let tx = contractTransaction({
        source: adminSource,
        networkPassphrase,
        contractId: tokenId,
        method: "mint",
        params: [new SorobanClient.Address(account).toScVal(), amountScVal],
      });

      //Sends the transactions to the blockchain
      let result = await sendTransaction(tx, options);
      if (result) {
        alert("Success!");
      }
      console.log(
        "🚀 ~ file: MintButton.tsx:63 ~ mintTokens ~ result:",
        result,
      );

      //This will connect again the wallet to fetch its data
      sorobanContext.connect();
    } catch (error) {
      console.log("🚀 « error:", error);
    }

    setSubmitting(false);
  };

  return (
    <Button variant="contained" onClick={mintTokens} disabled={isSubmitting}>
      Mint!
    </Button>
  );
}
