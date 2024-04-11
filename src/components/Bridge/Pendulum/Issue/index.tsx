import { Button } from "@mui/material";
import { EventRecord } from "@polkadot/types/interfaces";
import { useInkathon } from "@scio-labs/use-inkathon";
import BigNumber from "bignumber.js";
import bs58 from "bs58";
import { useMemo } from "react";
import { useIssuePallet } from "./useIssuePallet";

export type IssueFormValues = {
  amount: number;
  securityDeposit: number;
  to: number;
};

export function IssueComponent() {
  const { activeAccount, activeSigner } = useInkathon();
  const {createIssueRequestExtrinsic} = useIssuePallet();
  
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

  // const submitRequestIssueExtrinsic = useCallback(
  //   (_values: IssueFormValues) => {
  //     if (!requestIssueExtrinsic) {
  //       return;
  //     }

  //     if (!activeAccount) {
  //       // showToast(ToastMessage.NO_WALLET_SELECTED);
  //       return;
  //     }

  //     // setSubmissionPending(true);

  //     requestIssueExtrinsic
  //       .signAndSend(activeAccount.address, { signer: activeSigner }, (result) => {
  //         const { status, events } = result;

  //         const errors = getErrors(events, api);
  //         if (status.isInBlock) {
  //           if (errors.length > 0) {
  //             const errorMessage = `Transaction failed with errors: ${errors.join('\n')}`;
  //             console.error(errorMessage);
  //             showToast(ToastMessage.ERROR, errorMessage);
  //           }
  //         } else if (status.isFinalized) {
  //           const requestIssueEvents = getEventBySectionAndMethod(events, 'issue', 'RequestIssue');

  //           // We only expect one event but loop over all of them just in case
  //           for (const requestIssueEvent of requestIssueEvents) {
  //             // We do not have a proper type for this event, so we have to cast it to any
  //             const issueId = (requestIssueEvent.data as any).issueId;

  //             getIssueRequest(issueId).then((issueRequest) => {
  //               setSubmittedIssueRequest(issueRequest);
  //             });
  //           }

  //           setSubmissionPending(false);

  //           if (errors.length === 0) {
  //             setConfirmationDialogVisible(true);
  //           }
  //         }
  //       })
  //       .catch((error) => {
  //         console.error('Transaction submission failed', error);
  //         showToast(ToastMessage.ERROR, 'Transaction submission failed: ' + error.toString());
  //         setSubmissionPending(false);
  //       });
  //   },
  //   [api, getIssueRequest, requestIssueExtrinsic, selectedVault, walletAccount],
  // );
  // const handleTestButton = async() => {
  //   const issueRequest = test.createIssueRequestExtrinsic(
  //     amountRaw,
  //     xlmVaultId
  //   )
  //   issueRequest?.signAndSend(activeAccount?.address!, { signer: activeSigner }, (result) => {
  //     // console.log("result", result)
  //     // const memo = deriveShortenedRequestId(result.issueId);
  //     // console.log("🚀 « memo:", memo);

  //     // let stellarVaultAccountFromEvent = result.vaultStellarPublicKey;
  //     // console.log(
  //     //   "🚀 « stellarVaultAccountFromEvent:",
  //     //   stellarVaultAccountFromEvent
  //     // );
  //   });
  // }
    
  return (
    <>  
      Issuer
      <Button> TEST ISSUANCE</Button>
    </>
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
