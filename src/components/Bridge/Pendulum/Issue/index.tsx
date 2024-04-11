import { Box } from "@mui/material";
import { EventRecord } from "@polkadot/types/interfaces";
import { useInkathon } from "@scio-labs/use-inkathon";
import { useSorobanReact } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import bs58 from "bs58";
import { ButtonPrimary } from "components/Buttons/Button";
import ButtonLoadingSpinner from "components/Buttons/LoadingButtonSpinner";
import { useCallback, useMemo, useState } from "react";
import { Asset, BASE_FEE, Memo, Operation, StrKey, TransactionBuilder } from "stellar-sdk";
import { useIssuePallet } from "./useIssuePallet";

export type IssueFormValues = {
  amount: number;
  securityDeposit: number;
  to: number;
};

export function IssueComponent() {
  const { address, serverHorizon, activeChain, activeConnector } = useSorobanReact();
  const { activeAccount, activeSigner, api } = useInkathon();
  const { createIssueRequestExtrinsic, getIssueRequest } = useIssuePallet();
  const [isBridging, setIsBridging] = useState<boolean>(false)
  
  const XLM_VAULT_ACCOUNT_ID =
  "6cKoXRGxqpXQZavYAXPuXYFKNAev8QuHJ2zhh9rnWc3XMmTr";

  let xlmVaultId = useMemo(() => {
    return {
      accountId: XLM_VAULT_ACCOUNT_ID,
      currencies: {
        collateral: { XCM: 0 },
        wrapped: { Stellar: "StellarNative" },
      },
    };
  }, [])

  const decimalToStellarNative = (value: string) => {
    let bigIntValue;
    try {
      bigIntValue = new BigNumber(value);
    } catch (error) {
      bigIntValue = new BigNumber(0);
    }
    const multiplier = new BigNumber(10).pow(12);
    return bigIntValue.times(multiplier);
  };

  // This function is used to derive a shorter identifier that can be used as a TEXT MEMO by a user when creating a Stellar transaction
  // to fulfill an issue request. This is only used for _issue_ requests, not for redeem or replace requests.
  const deriveShortenedRequestId = (requestIdHex: string) => {
    // Remove the 0x prefix
    requestIdHex = requestIdHex.slice(2);
    // Convert the hex string to a buffer
    const requestId = Uint8Array.from(Buffer.from(requestIdHex, "hex"));

    // This derivation matches the one used in the Spacewalk pallets
    return bs58.encode(requestId).slice(0, 28);
  }

  const amountRaw = decimalToStellarNative("1").toString();

  const requestIssueExtrinsic = useMemo(() => {
    if (!xlmVaultId) {
      return undefined;
    }

    return createIssueRequestExtrinsic(amountRaw, xlmVaultId);
  }, [amountRaw, createIssueRequestExtrinsic, xlmVaultId]);

  // console.log('🚀 « requestIssueExtrinsic:', requestIssueExtrinsic);
  const createStellarPayment = async (recipient: string, memo: string) => {
    console.log("address", address)
    if(!address) console.log("Stellar Wallet not connected")
    const sourceAccount = await serverHorizon?.loadAccount(address!)
    if(!sourceAccount) throw new Error("Couldnt load stellar account")
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: activeChain?.networkPassphrase,
    })
      .addOperation(
        Operation.payment({
          destination: recipient,
          asset: Asset.native(),
          amount: "1",
        }),
      )
      .addMemo(Memo.text(memo))
      // Wait a maximum of three minutes for the transaction
      .setTimeout(180)
      .build();
    // Sign the transaction to prove you are actually the person sending it.
    const signed = await activeConnector?.signTransaction(
      transaction.toXDR(),
      {
        networkPassphrase: activeChain?.networkPassphrase,
      }
    );
    console.log("🚀 « signed:", signed);

    const transactionToSubmit = TransactionBuilder.fromXDR(
      signed!,
      activeChain?.networkPassphrase!
    );
    console.log("🚀 « transactionToSubmit:", transactionToSubmit);

    let response = await serverHorizon?.submitTransaction(transaction);
    console.log('🚀 « response:', response);
    
  }

  const submitRequestIssueExtrinsic = useCallback(() => {
    if (!requestIssueExtrinsic) {
      console.log("Error: no requestIssueExtrinsic")
      return;
    }

    if (!activeAccount) {
      console.log('Error No wallet connected');
      // showToast(ToastMessage.NO_WALLET_SELECTED);
      return;
    }

    // setSubmissionPending(true);
    setIsBridging(true)

    requestIssueExtrinsic
      .signAndSend(activeAccount.address, { signer: activeSigner }, (result) => {
        const { status, events } = result;

        const errors = getErrors(events, api);
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
            console.log('🚀 « requestIssueEvent:', requestIssueEvent);
            // We do not have a proper type for this event, so we have to cast it to any
            const issueId = (requestIssueEvent.data as any).issueId;
            const memo = deriveShortenedRequestId(issueId);
            console.log("🚀 « memo:", memo);
          
            let stellarVaultAccountFromEventHex = (requestIssueEvent.data as any)?.vaultStellarPublicKey;
            
            // console.log(parseEventIssueRequest(requestIssueEvent))

            console.log(
              "🚀 « stellarVaultAccountFromEvent:",
              stellarHexToPublic(stellarVaultAccountFromEventHex.toString())
            );

            const stellarVaultAddress = stellarHexToPublic(stellarVaultAccountFromEventHex.toString())

            getIssueRequest(issueId).then((issueRequest) => {
              console.log('🚀 « issueRequest:', issueRequest);
              createStellarPayment(stellarVaultAddress, memo)
              // setSubmittedIssueRequest(issueRequest);
            });
          }

          // setSubmissionPending(false);

          if (errors.length === 0) {
            console.log("Confirmed!" )
            // setConfirmationDialogVisible(true);

          }
        }
      })
      .catch((error) => {
        console.error('Transaction submission failed', error);
        // showToast(ToastMessage.ERROR, 'Transaction submission failed: ' + error.toString());
        // setSubmissionPending(false);
        setIsBridging(false)
        
      });
    },
    [activeAccount, activeSigner, api, getIssueRequest, requestIssueExtrinsic],
  );
    
  return (
    <Box>  
      Issuer, testing sending 1 XLM
      <ButtonPrimary width="40%" onClick={() => submitRequestIssueExtrinsic()} disabled={isBridging || !address}>{isBridging ? <ButtonLoadingSpinner /> : "TEST ISSUANCE"}</ButtonPrimary>
    </Box>
  );
}

export function getErrors(events: EventRecord[], api: any) {
  return (
    events
      // find/filter for failed events
      .filter(({ event }) => api.events.system.ExtrinsicFailed.is(event))
      // we know that data for system.ExtrinsicFailed is
      // (DispatchError, DispatchInfo)
      .map(
        ({
          event: {
            data: [error],
          },
        }) => {
          if ((error as any).isModule) {
            const decoded = api.registry.findMetaError((error as any).asModule);
            const { docs, method, section } = decoded;

            return `${section}.${method}: ${docs.join(' ')}`;
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            return error.toString();
          }
        },
      )
  );
}

export function getEventBySectionAndMethod(events: EventRecord[], section: string, method: string) {
  return events
    .filter(
      ({ event: { method: eventMethod, section: eventSection } }) =>
        eventSection.toLowerCase() === section.toLowerCase() && eventMethod.toLowerCase() === method.toLowerCase(),
    )
    .map((event) => event.event);
}

export function stellarHexToPublic(hexString: string) {
  return StrKey.encodeEd25519PublicKey(hexToBuffer(hexString));
}

export function hexToBuffer(hexString: string) {
  if (hexString.length % 2 !== 0) {
    throw new Error(
      "The provided hex string has an odd length. It must have an even length."
    );
  }
  return Buffer.from(hexString.split("0x")[1], "hex");
}

export function parseEventIssueRequest(event: any) {
  const rawEventData = JSON.parse(event.event.data.toString());

  const mappedData = {
    issueId: rawEventData[0].toString(),
    requester: rawEventData[1].toString(),
    amount: parseInt(rawEventData[2].toString(), 10),
    asset: rawEventData[3],
    fee: parseInt(rawEventData[4].toString(), 10),
    griefingCollateral: parseInt(rawEventData[5].toString(), 10),
    vaultId: {
      accountId: rawEventData[6].accountId.toString(),
      currencies: {
        collateral: {
          XCM: parseInt(
            rawEventData[6].currencies.collateral.xcm.toString(),
            10
          ),
        },
        wrapped: rawEventData[6].currencies.wrapped,
      },
    },
    vaultStellarPublicKey: stellarHexToPublic(rawEventData[7].toString()),
  };
  return mappedData;
}