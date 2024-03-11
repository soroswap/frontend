import { contractInvoke } from '@soroban-react/contracts';
import { useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { SnackbarIconType } from 'contexts';
import { bigNumberToI128 } from 'helpers/utils';
import { TokenType } from 'interfaces';
import { useCallback } from 'react';
import * as StellarSdk from 'stellar-sdk';
import { useApiTokens } from './tokens/useApiTokens';
import useNotification from './useNotification';
interface MintTestTokenProps {
  onTokenMintedStart?: (token: TokenType) => void;
  onTokenMintedSuccess?: (token: TokenType) => void;
  onTokenMintedError?: (token: TokenType) => void;
}

export function useMintTestToken() {
  const sorobanContext = useSorobanReact();
  const admin_account = StellarSdk.Keypair.fromSecret(
    process.env.NEXT_PUBLIC_TEST_TOKENS_ADMIN_SECRET_KEY as string,
  );

  const { tokens } = useApiTokens();
  const { notify } = useNotification();

  return useCallback(
    async ({
      onTokenMintedStart,
      onTokenMintedSuccess,
      onTokenMintedError,
    }: MintTestTokenProps) => {
      const server = sorobanContext.server;
      const account = sorobanContext.address;

      const amountScVal = bigNumberToI128(BigNumber(2500000).shiftedBy(7));
      let adminSource;

      try {
        adminSource = await server?.getAccount(admin_account.publicKey());
      } catch (error) {
        alert('Your wallet or the token admin wallet might not be funded');
        return;
      }

      if (!account) {
        return;
      }
      if (!adminSource) {
        return;
      }

      let result;
      let totalMinted = 0;

      for (const token of tokens) {
        try {
          onTokenMintedStart?.(token);
          result = (await contractInvoke({
            contractAddress: token.contract,
            method: 'mint',
            args: [new StellarSdk.Address(account).toScVal(), amountScVal],
            sorobanContext,
            signAndSend: true,
            secretKey: admin_account.secret(),
            reconnectAfterTx: false,
          })) as StellarSdk.SorobanRpc.Api.GetTransactionResponse;

          if (result.status !== StellarSdk.SorobanRpc.Api.GetTransactionStatus.SUCCESS)
            throw result;

          totalMinted++;
          onTokenMintedSuccess?.(token);
        } catch (error) {
          onTokenMintedError?.(token);
        }
      }

      if (totalMinted > 0) {
        notify({
          message: `Minted test tokens successfully`,
          title: 'Mint',
          type: SnackbarIconType.MINT,
        });
      } else {
        notify({
          message: `Minted test tokens failed`,
          title: 'Error',
          type: SnackbarIconType.ERROR,
        });
      }
    },
    [admin_account, sorobanContext, tokens, notify],
  );
}
