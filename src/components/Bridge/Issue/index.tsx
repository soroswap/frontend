import { useInkathon } from '@scio-labs/use-inkathon';
import { useSorobanReact } from 'soroban-react-stellar-wallets-kit';
import { BASE_FEE, Memo, Operation, TransactionBuilder } from '@stellar/stellar-sdk';
import { deriveShortenedRequestId } from 'helpers/bridge/pendulum/spacewalk';
import {
  convertRawHexKeyToPublicKey,
  decimalToStellarNative,
} from 'helpers/bridge/pendulum/stellar';
import { getEventBySectionAndMethod, getSubstrateErrors } from 'helpers/bridge/pendulum/substrate';
import { useIssuePallet } from 'hooks/bridge/pendulum/useIssuePallet';
import useSpacewalkBridge from 'hooks/bridge/pendulum/useSpacewalkBridge';
import { useCallback, useMemo, useState } from 'react';
import { Box, Button, MenuItem, Select, TextField } from 'soroswap-ui';
import { BridgeButton } from '../BridgeButton';

export type IssueFormValues = {
  amount: number;
  securityDeposit: number;
  to: number;
};

export function IssueComponent() {
  const { address, serverHorizon, activeChain, activeConnector } = useSorobanReact();
  const { activeAccount, activeSigner, api } = useInkathon();
  const { selectedVault, setSelectedAsset, wrappedAssets, selectedAsset, vaults } =
    useSpacewalkBridge();
  const { createIssueRequestExtrinsic, getIssueRequest } = useIssuePallet();
  const [isBridging, setIsBridging] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');

  const amountRaw = decimalToStellarNative(amount).toString();

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
          setIsBridging(false);
        }
      } catch (error) {
        console.error('Error submitting transaction:', error);
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

    setIsBridging(true);

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
              createStellarPayment(stellarVaultAddress.publicKey(), memo);
            });
          }

          if (errors.length === 0) {
            console.log('Confirmed!');
            // setConfirmationDialogVisible(true);
          }
        }
      })
      .catch((error) => {
        console.error('Transaction submission failed', error);
        setIsBridging(false);
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

  const handleAssetSelection = (assetCode: string) => {
    const newAsset = wrappedAssets?.find((ast) => ast.code == assetCode);
    setSelectedAsset(newAsset);
  };

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {wrappedAssets && wrappedAssets.length > 0 && (
        <Box mb={2}>
          <Select
            value={selectedAsset?.code}
            onChange={(e) => handleAssetSelection(e.target.value)}
          >
            {wrappedAssets?.map((asset, index) => (
              <MenuItem key={index} value={asset.code}>
                {asset.code}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}
      <TextField
        label="Amount to Bridge to Pendulum"
        variant="outlined"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        fullWidth
        type="number"
      />
      <Box>
        You will receive: {amount} {selectedAsset?.code}.s
      </Box>
      <BridgeButton isLoading={isBridging} callback={submitRequestIssueExtrinsic} />
      <Button onClick={() => console.log('selectedVault', selectedVault)}>TEST</Button>
    </Box>
  );
}
