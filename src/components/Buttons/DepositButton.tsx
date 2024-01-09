import { Button } from '@mui/material';
import { contractTransaction, useSendTransaction } from '@soroban-react/contracts';
import { SorobanContextType } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import * as StellarSdk from 'stellar-sdk';import { bigNumberToI128 } from '../../helpers/utils';

interface DepositButtonProps {
  pairAddress: string;
  amount0: BigNumber;
  amount1: BigNumber;
  sorobanContext: SorobanContextType;
}

export function DepositButton({
  pairAddress,
  amount0,
  amount1,
  sorobanContext,
}: DepositButtonProps) {
  const [isSubmitting, setSubmitting] = useState(false);
  const networkPassphrase = sorobanContext.activeChain?.networkPassphrase ?? '';
  const server = sorobanContext.server;
  const account = sorobanContext.address;
  const { sendTransaction } = useSendTransaction();

  const depositTokens = async () => {
    setSubmitting(true);

    //Parse amount to mint to BigNumber and then to i128 scVal
    const desiredAScVal = bigNumberToI128(amount0);
    const desiredBScVal = bigNumberToI128(amount1);

    const minAScVal = bigNumberToI128(amount0.multipliedBy(0.9).decimalPlaces(0));
    const minBScVal = bigNumberToI128(amount1.multipliedBy(0.9).decimalPlaces(0));

    let walletSource;

    if (!account) {
      return;
    }

    try {
      walletSource = await server?.getAccount(account!);
    } catch (error) {
      alert('Your wallet or the token admin wallet might not be funded');
      setSubmitting(false);
      return;
    }
    if (!walletSource) {
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
        contractAddress: pairAddress,
        method: 'deposit',
        args: [
          new StellarSdk.Address(account!).toScVal(),
          desiredAScVal,
          minAScVal,
          desiredBScVal,
          minBScVal,
        ],
      });

      //Sends the transactions to the blockchain

      let result = await sendTransaction(tx, options);

      if (result) {
        alert('Success!');
      }

      //This will connect again the wallet to fetch its data
      sorobanContext.connect();
    } catch (error) {}

    setSubmitting(false);
  };

  return (
    <Button variant="contained" onClick={depositTokens} disabled={isSubmitting}>
      Deposit Liquidity!
    </Button>
  );
}
