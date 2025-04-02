import { Button } from 'soroswap-ui';
import { SorobanContextType, WalletNetwork } from 'stellar-react';
import { useContext, useState } from 'react';

import { contractInvoke } from 'stellar-react';
import BigNumber from 'bignumber.js';
import { AppContext, SnackbarIconType } from 'contexts';
import { sendNotification } from 'functions/sendNotification';
import { TokenType } from 'interfaces';
import * as StellarSdk from '@stellar/stellar-sdk';
import { bigNumberToI128 } from '../../helpers/utils';

interface MintButtonProps {
  sorobanContext: SorobanContextType;
  token: TokenType;
  amountToMint: BigNumber;
}

export function MintButton({ sorobanContext, token, amountToMint }: MintButtonProps) {
  const { SnackbarContext } = useContext(AppContext);
  const [isSubmitting, setSubmitting] = useState(false);
  const server = sorobanContext.sorobanServer;
  const account = sorobanContext.address;
  const admin_account = StellarSdk.Keypair.fromSecret(
    process.env.NEXT_PUBLIC_TEST_TOKENS_ADMIN_SECRET_KEY as string,
  );

  const mintTokens = async () => {
    setSubmitting(true);

    //Parse amount to mint to BigNumber and then to i128 scVal

    const amount = amountToMint.shiftedBy(7);

    const amountScVal = bigNumberToI128(amount);

    let adminSource, walletSource;

    try {
      adminSource = await server?.getAccount(admin_account.publicKey());
    } catch (error) {
      console.log('error from mint button', error);
      alert('Your wallet or the token admin wallet might not be funded');
      setSubmitting(false);
      return;
    }

    if (!account) {
      return;
    }
    if (!adminSource) {
      return;
    }

    try {
      // let tx = contractTransaction({
      //   source: adminSource,
      //   networkPassphrase,
      //   contractAddress: tokenId,
      //   method: "mint",
      //   args: [new StellarSdk.Address(account).toScVal(), amountScVal],
      // });
      // //Sends the transactions to the blockchain
      // let result = await sendTransaction(tx, options);

      let result = await contractInvoke({
        contractAddress: token.contract,
        method: 'mint',
        args: [new StellarSdk.Address(account).toScVal(), amountScVal],
        sorobanContext,
        signAndSend: true,
        secretKey: admin_account.secret(),
      });

      if (result) {
        sendNotification(
          `Minted ${amountToMint} ${token.code}`,
          'Minted',
          SnackbarIconType.MINT,
          SnackbarContext,
        );
      }

      //This will connect again the wallet to fetch its data
      sorobanContext.connect();
    } catch (error) { }

    setSubmitting(false);
  };

  return (
    <Button variant="contained" onClick={mintTokens} disabled={isSubmitting}>
      Mint!
    </Button>
  );
}
