import { Button } from '@mui/material';
import { contractTransaction, useSendTransaction } from '@soroban-react/contracts';
import { SorobanContextType } from '@soroban-react/core';
import { useState } from 'react';
import * as StellarSdk from 'stellar-sdk';
import { accountToScVal } from '../../helpers/utils';
import { useFactory } from '../../hooks';
import { TokenType } from '../../interfaces';

interface CreatePairProps {
  token0: TokenType;
  token1: TokenType;
  sorobanContext: SorobanContextType;
}

export function CreatePairButton({ token0, token1, sorobanContext }: CreatePairProps) {
  const { factory } = useFactory(sorobanContext);
  const [isSubmitting, setSubmitting] = useState(false);
  const networkPassphrase = sorobanContext.activeChain?.networkPassphrase ?? '';
  const server = sorobanContext.server;
  const account = sorobanContext.address;
  const addressScVal0 = accountToScVal(token0.address);
  const addressScVal1 = accountToScVal(token1.address);
  const params = [addressScVal0, addressScVal1];

  let xdr = StellarSdk.xdr;
  const { sendTransaction } = useSendTransaction();

  const createPair = async () => {
    setSubmitting(true);

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
        contractAddress: factory!,
        method: 'create_pair',
        args: params,
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
    <Button variant="contained" onClick={createPair} disabled={isSubmitting}>
      Create Pair!
    </Button>
  );
}
