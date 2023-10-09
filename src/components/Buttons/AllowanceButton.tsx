import { Button } from "@mui/material";
import {
    contractTransaction,
    useSendTransaction,
} from "@soroban-react/contracts";
import { SorobanContextType } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { useState } from "react";
import * as SorobanClient from "soroban-client";
import { bigNumberToI128 } from "../../helpers/utils";

interface AllowanceButtonProps {
  tokenAddress: string;
  spenderAddress:string;
  amount: BigNumber;
  sorobanContext: SorobanContextType;
}

export function AllowanceButton({
  tokenAddress,
  spenderAddress,
  amount,
  sorobanContext,
}: AllowanceButtonProps) {
  const [isSubmitting, setSubmitting] = useState(false);
  const networkPassphrase = sorobanContext.activeChain?.networkPassphrase ?? "";
  const server = sorobanContext.server;
  const account = sorobanContext.address;
  const { sendTransaction } = useSendTransaction();

  const allowTokens = async () => {
    setSubmitting(true);

    //Parse amount to mint to BigNumber and then to i128 scVal
    const amountScVal = bigNumberToI128(amount);

    let walletSource;

    try {
      walletSource = await server?.getAccount(account!);
    } catch (error) {
      alert("Your wallet or the token admin wallet might not be funded");
      setSubmitting(false);
      return;
    }

    const options = {
      sorobanContext,
    };

    try {
      //Builds the transaction
      let tx = contractTransaction({
        source: walletSource!,
        networkPassphrase,
        contractAddress: tokenAddress,
        method: "increase_allowance",
        args: [
            new SorobanClient.Address(account!).toScVal(),
            new SorobanClient.Address(spenderAddress).toScVal(),
            amountScVal,
        ],
      });

      //Sends the transactions to the blockchain
      console.log(tx);

      let result = await sendTransaction(tx, options);

      if (result) {
        alert("Success!");
      }
      console.log("🚀 ~ file: AllowanceButton.tsx ~ swapTokens ~ result:", result);

      //This will connect again the wallet to fetch its data
      sorobanContext.connect();
    } catch (error) {
      console.log("🚀 « error:", error);
    }

    setSubmitting(false);
  };

  return (
    <Button variant="contained" onClick={allowTokens} disabled={isSubmitting}>
      Allow spending
    </Button>
  );
}
