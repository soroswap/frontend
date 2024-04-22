import {
  convertRawHexKeyToPublicKey,
  decimalToStellarNative,
} from 'helpers/bridge/pendulum/stellar';

import { useInkathon } from '@scio-labs/use-inkathon';
import { useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { deriveShortenedRequestId } from 'helpers/bridge/pendulum/spacewalk';
import { getEventBySectionAndMethod, getSubstrateErrors } from 'helpers/bridge/pendulum/substrate';
import { useIssuePallet } from 'hooks/bridge/pendulum/useIssuePallet';
import { useCallback, useMemo, useState } from 'react';
import { Asset, BASE_FEE, Memo, Operation, TransactionBuilder } from 'stellar-sdk';
import { VaultId } from './useSpacewalkVaults';

interface Props {
  amount: string;
  selectedAsset: Asset | undefined;
  selectedVault: VaultId | undefined;
}

const useIssueHandler = ({ amount, selectedAsset, selectedVault }: Props) => {
  const { address, serverHorizon, activeChain, activeConnector } = useSorobanReact();

  const { activeAccount, activeSigner, api } = useInkathon();

  const { createIssueRequestExtrinsic, getIssueRequest } = useIssuePallet();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txSuccess, setTxSuccess] = useState<boolean>(false);
  const [txError, setTxError] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | undefined>();

  const amountRaw = useMemo(() => {
    return Number(amount) ? decimalToStellarNative(amount).toString() : new BigNumber(0).toString();
  }, [amount]);

  const requestIssueExtrinsic = useMemo(() => {
    if (!selectedVault || !amount) {
      return undefined;
    }

    return createIssueRequestExtrinsic(amountRaw, selectedVault);
  }, [amount, amountRaw, createIssueRequestExtrinsic, selectedVault]);

  const createStellarPayment = useCallback(
    async (recipient: string, memo: string) => {
      if (!address || !selectedAsset) {
        console.log('Stellar Wallet not connected');
        return;
      }

      const sourceAccount = await serverHorizon?.loadAccount(address);
      if (!sourceAccount) throw new Error("Couldn't load stellar account");

      const fee = await serverHorizon?.fetchBaseFee();
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: fee ? String(fee) : BASE_FEE,
        networkPassphrase: activeChain?.networkPassphrase,
      })
        .addOperation(
          Operation.payment({
            destination: recipient,
            asset: selectedAsset,
            amount: amount,
          }),
        )
        .addMemo(Memo.text(memo))
        .setTimeout(180)
        .build();

      const signedXDR = await activeConnector?.signTransaction(transaction.toXDR(), {
        networkPassphrase: activeChain?.networkPassphrase,
      });

      if (!signedXDR) throw new Error("Couldn't sign transaction");
      console.log('🚀 « signedXDR:', signedXDR);

      const transactionToSubmit = TransactionBuilder.fromXDR(
        signedXDR,
        activeChain?.networkPassphrase ?? '',
      );
      console.log('🚀 « transactionToSubmit:', transactionToSubmit);

      try {
        let response = await serverHorizon?.submitTransaction(transactionToSubmit);
        console.log('🚀 « response:', response);
        if (response) {
          setIsLoading(false);
          setTxSuccess(true);
          setTxHash(response.hash);
        }
      } catch (error) {
        console.error('Error submitting transaction:', error);
        setTxError(true);
      }
    },
    [
      activeChain?.networkPassphrase,
      activeConnector,
      address,
      amount,
      selectedAsset,
      serverHorizon,
    ],
  );

  const submitRequestIssueExtrinsic = useCallback(() => {
    if (!amount) {
      console.log('Error: no amount');
      return;
    }
    if (!requestIssueExtrinsic) {
      console.log('Error: no requestIssueExtrinsic');
      return;
    }

    if (!activeAccount) {
      console.log('Error No wallet connected');
      return;
    }

    if (!api) {
      console.log('Error No wallet connected');
      return;
    }

    setIsLoading(true);
    setTxSuccess(false);
    setTxError(false);
    setTxHash(undefined);

    requestIssueExtrinsic
      .signAndSend(activeAccount.address, { signer: activeSigner }, (result) => {
        const { status, events } = result;

        const errors = getSubstrateErrors(events, api);
        if (status.isInBlock) {
          if (errors.length > 0) {
            const errorMessage = `Transaction failed with errors: ${errors.join('\n')}`;
            console.error(errorMessage);
            // showToast(ToastMessage.ERROR, errorMessage);
          }
        } else if (status.isFinalized) {
          const requestIssueEvents = getEventBySectionAndMethod(events, 'issue', 'RequestIssue');

          // We only expect one event but loop over all of them just in case
          for (const requestIssueEvent of requestIssueEvents) {
            // We do not have a proper type for this event, so we have to cast it to any
            const issueId = (requestIssueEvent.data as any).issueId;
            const memo = deriveShortenedRequestId(issueId.toString());

            let stellarVaultAccountFromEventHex = (requestIssueEvent.data as any)
              ?.vaultStellarPublicKey;
            const stellarVaultAddress = convertRawHexKeyToPublicKey(
              stellarVaultAccountFromEventHex.toString(),
            );

            getIssueRequest(issueId).then((issueRequest) => {
              createStellarPayment(stellarVaultAddress.publicKey(), memo).catch((err) => {
                setTxError(true);
              });
            });
          }

          if (errors.length === 0) {
            console.log('Confirmed!');
            // setConfirmationDialogVisible(true);
          } else {
            setTxError(true);
          }
        }
      })
      .catch((error) => {
        console.error('Transaction submission failed', error);
        setIsLoading(false);
        setTxError(true);
      });
  }, [
    activeAccount,
    activeSigner,
    amount,
    api,
    createStellarPayment,
    getIssueRequest,
    requestIssueExtrinsic,
  ]);

  const resetStates = () => {
    setIsLoading(false);
    setTxSuccess(false);
    setTxError(false);
    setTxHash(undefined);
  };

  return {
    extrinsic: requestIssueExtrinsic,
    handler: submitRequestIssueExtrinsic,
    isLoading,
    txSuccess,
    txError,
    setIsLoading,
    setTxError,
    setTxSuccess,
    txHash,
    setTxHash,
    resetStates,
  };
};

export default useIssueHandler;
