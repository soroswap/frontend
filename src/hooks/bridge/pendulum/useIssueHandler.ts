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
import { UseStepperState } from './useModalStepper';
import { StepKeys, IssueStepsByKeys  } from 'components/Bridge/BridgeSteps';
interface Props {
  amount: string;
  selectedAsset: Asset | undefined;
  selectedVault: VaultId | undefined;
  stepper: UseStepperState;
}

const useIssueHandler = ({ amount, selectedAsset, selectedVault, stepper }: Props) => {
  const { address, serverHorizon, activeChain, activeConnector } = useSorobanReact();

  const { activeAccount, activeSigner, api } = useInkathon();

  const { createIssueRequestExtrinsic, getIssueRequest } = useIssuePallet();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txSuccess, setTxSuccess] = useState<boolean>(false);
  const [txError, setTxError] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [tryAgain, setTryAgain] = useState<{ show: boolean; fn: any }>({ show: false, fn: null });

  const txType = 'ISSUE';
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
      const res = await serverHorizon?.submitTransaction(transactionToSubmit);
      console.log('🚀 « response:', res);

      if (res) {
        setIsLoading(false);
        setTxSuccess(true);
        setTxHash(res.hash);
        setTryAgain({ show: false, fn: null });
      } else {
        throw new Error("Couldn't submit transaction");
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
    setErrorMessage(undefined);
    setTryAgain({ show: false, fn: null });

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

            getIssueRequest(issueId).then(async (issueRequest) => {
              try {
                stepper.setActiveStep(IssueStepsByKeys[StepKeys.SIGN_TX]);
                await createStellarPayment(stellarVaultAddress.publicKey(), memo);
              } catch (error) {
                console.error('Error submitting transaction:', error);
                const msg = (error as any)?.message || 'Unexpected error';
                setTryAgain({
                  show: true,
                  fn: async () => {
                    try {
                      setIsLoading(true);
                      setTxError(false);
                      setErrorMessage(undefined);
                      stepper.setActiveStep(IssueStepsByKeys[StepKeys.SIGN_TX]);
                      await createStellarPayment(stellarVaultAddress.publicKey(), memo);
                    } catch (error) {
                      setErrorMessage(msg);
                      setTxError(true);
                    }
                  },
                });
                setErrorMessage(msg);
                setTxError(true);
              }
            });
          }

          if (errors.length === 0) {
            console.log('Confirmed!');
            stepper.setActiveStep(IssueStepsByKeys[StepKeys.SIGN_TX]);
            // setConfirmationDialogVisible(true);
          } else {
            const errMessage = `Transaction failed with errors: ${errors.join('\n')}`;
            setErrorMessage(errMessage);
            setTxError(true);
          }
        }
      })
      .catch((error) => {
        const msg = (error as any)?.message || 'Unknown error';
        setErrorMessage(msg);
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
    setErrorMessage(undefined);
    setTryAgain({ show: false, fn: null });
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
    errorMessage,
    tryAgain,
    txType
  };
};

export default useIssueHandler;
