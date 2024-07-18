import { useInkathon } from '@scio-labs/use-inkathon';
import { useSorobanReact } from '@soroban-react/core';
import { Asset } from '@stellar/stellar-sdk';
import BigNumber from 'bignumber.js';
import { decimalToStellarNative, isPublicKey } from 'helpers/bridge/pendulum/stellar';
import { getEventBySectionAndMethod, getSubstrateErrors } from 'helpers/bridge/pendulum/substrate';
import { useRedeemPallet } from 'hooks/bridge/pendulum/useRedeemPallet';
import { useCallback, useMemo, useState } from 'react';
import { VaultId } from './useSpacewalkVaults';

interface Props {
  amount: string;
  selectedAsset: Asset | undefined;
  selectedVault: VaultId | undefined;
}

const useRedeemHandler = ({ amount, selectedAsset, selectedVault }: Props) => {
  const { activeAccount, activeSigner, api } = useInkathon();
  const { createRedeemRequestExtrinsic, getRedeemRequest } = useRedeemPallet();
  const { address: stellarAddress } = useSorobanReact();

  const [isLoading, setIsLoading] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);
  const [txError, setTxError] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const txType = 'REDEEM';

  const amountRaw = useMemo(() => {
    return Number(amount) ? decimalToStellarNative(amount).toString() : new BigNumber(0).toString();
  }, [amount]);

  const requestRedeemExtrinsic = useMemo(() => {
    if (!selectedVault || !api || !stellarAddress || !isPublicKey(stellarAddress)) {
      return undefined;
    }

    return createRedeemRequestExtrinsic(amountRaw, stellarAddress, selectedVault);
  }, [amountRaw, api, createRedeemRequestExtrinsic, selectedVault, stellarAddress]);

  const submitRequestRedeemExtrinsic = useCallback(() => {
    if (!requestRedeemExtrinsic || !api || !selectedVault) {
      return;
    }

    if (!activeAccount?.address) {
      console.log('Error: No Polkadot wallet connected');
      return;
    }

    setIsLoading(true);
    setTxSuccess(false);
    setTxError(false);
    setTxHash(undefined);
    setErrorMessage(undefined);

    requestRedeemExtrinsic
      .signAndSend(activeAccount.address, { signer: activeSigner as any }, (result: any) => {
        const { status, events } = result;

        const errors = getSubstrateErrors(events, api);
        if (status.isInBlock) {
          if (errors.length > 0) {
            const errorMessage = `Transaction failed with errors: ${errors.join('\n')}`;
            console.error(errorMessage);
            console.log(errorMessage);
          }
        } else if (status.isFinalized) {
          const requestRedeemEvents = getEventBySectionAndMethod(events, 'redeem', 'RequestRedeem');

          // We only expect one event but loop over all of them just in case
          for (const requestRedeemEvent of requestRedeemEvents) {
            // We do not have a proper type for this event, so we have to cast it to any
            const redeemId = (requestRedeemEvent.data as any).redeemId;

            getRedeemRequest(redeemId).then((redeemRequest) => {
              console.log('request', redeemRequest);
            });
          }

          setIsLoading(false);

          if (errors.length === 0) {
            console.log('transaction successfull');
            setTxSuccess(true);
          } else {
            const errMessage = `Transaction failed with errors: ${errors.join('\n')}`;
            setErrorMessage(errMessage);
            setTxError(true);
          }
        }
      })
      .catch((error: unknown) => {
        console.error('Transaction submission failed', error);
        const msg = (error as any)?.message || 'Unknown error';
        setErrorMessage(msg);
        setIsLoading(false);
        setTxError(true);
      });
  }, [
    requestRedeemExtrinsic,
    api,
    selectedVault,
    activeAccount?.address,
    activeSigner,
    getRedeemRequest,
  ]);

  const resetStates = () => {
    setIsLoading(false);
    setTxSuccess(false);
    setTxError(false);
    setTxHash(undefined);
    setErrorMessage(undefined);
  };

  return {
    extrinsic: requestRedeemExtrinsic,
    handler: submitRequestRedeemExtrinsic,
    isLoading,
    txSuccess,
    txError,
    setIsLoading,
    setTxSuccess,
    setTxError,
    txHash,
    setTxHash,
    resetStates,
    errorMessage,
    txType
  };
};

export default useRedeemHandler;
