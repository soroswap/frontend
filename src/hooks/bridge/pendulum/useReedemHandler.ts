import { Asset } from 'stellar-sdk';
import { decimalToStellarNative, isPublicKey } from 'helpers/bridge/pendulum/stellar';
import { getEventBySectionAndMethod, getSubstrateErrors } from 'helpers/bridge/pendulum/substrate';
import { useCallback, useMemo, useState } from 'react';
import { useInkathon } from '@scio-labs/use-inkathon';
import { useRedeemPallet } from 'hooks/bridge/pendulum/useRedeemPallet';
import { useSorobanReact } from '@soroban-react/core';
import { VaultId } from './useSpacewalkVaults';
import BigNumber from 'bignumber.js';

interface Props {
  amount: string;
  selectedAsset: Asset | undefined;
  selectedVault: VaultId | undefined;
}

const useReedemHandler = ({ amount, selectedAsset, selectedVault }: Props) => {
  const { activeAccount, activeSigner, api } = useInkathon();
  const { createRedeemRequestExtrinsic, getRedeemRequest } = useRedeemPallet();
  const { address: stellarAddress } = useSorobanReact();

  const [isLoading, setIsLoading] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);
  const [txError, setTxError] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>();

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
            setTxError(true);
          }
        }
      })
      .catch((error: unknown) => {
        console.error('Transaction submission failed', error);
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
  };

  return {
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
  };
};

export default useReedemHandler;
