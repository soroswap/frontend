import { EventRecord } from "@polkadot/types/interfaces";
import { useInkathon } from "@scio-labs/use-inkathon";
import { useSorobanReact } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { useCallback, useMemo, useState } from "react";

import { isPublicKey } from '../helpers/stellar';
import { getEventBySectionAndMethod } from '../helpers/substrate';
import { useRedeemPallet } from "./useRedeemPallet";

import { Box } from "@mui/material";
import { ButtonPrimary } from "components/Buttons/Button";
import ButtonLoadingSpinner from "components/Buttons/LoadingButtonSpinner";

export type RedeemFormValues = {
  amount: number;
  to: string;
};

export function RedeemComponent() {
  const { activeAccount, activeSigner, api } = useInkathon();
  const { createRedeemRequestExtrinsic, getRedeemRequest } = useRedeemPallet();
  const { address } = useSorobanReact();
  const [ submissionPending, setSubmissionPending ] = useState(false);
  
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
  const amount = '1';
  const amountRaw = useMemo(() => {
    return amount ? decimalToStellarNative(amount).toString() : new BigNumber(0).toString();
  }, [amount]);
  const stellarAddress = address;
  const requestRedeemExtrinsic = useMemo(() => {
    if (!xlmVaultId || !api || !stellarAddress || !isPublicKey(stellarAddress)) {
      return undefined;
    }

    return createRedeemRequestExtrinsic(amountRaw, stellarAddress, xlmVaultId);
  }, [amountRaw, api, createRedeemRequestExtrinsic, stellarAddress, xlmVaultId]);
  
  const submitRequestRedeemExtrinsic = useCallback(() => {
    if (!requestRedeemExtrinsic || !api || !xlmVaultId) {
      return;
    }

    if (!activeAccount?.address) {
      console.log("Error: No Polkadot wallet connected");
      return;
    }

    setSubmissionPending(true);

    requestRedeemExtrinsic
      .signAndSend(activeAccount.address, { signer: activeSigner as any }, (result: any) => {
        const { status, events } = result;

        const errors = getErrors(events, api);
        if (status.isInBlock) {
          if (errors.length > 0) {
            const errorMessage = `Transaction failed with errors: ${errors.join('\n')}`;
            console.error(errorMessage);
            console.log(errorMessage);
          }
        } else if (status.isFinalized) {
          const requestRedeemEvents = getEventBySectionAndMethod(events, "redeem", "RequestRedeem");

          // We only expect one event but loop over all of them just in case
          for (const requestRedeemEvent of requestRedeemEvents) {
            // We do not have a proper type for this event, so we have to cast it to any
            const redeemId = (requestRedeemEvent.data as any).redeemId;

            getRedeemRequest(redeemId).then((redeemRequest) => {
              console.log("request", redeemRequest);
            });
          }

          setSubmissionPending(false);

          if (errors.length === 0) {
            console.log("transaction successfull")
          }
        }
      })
      .catch((error: unknown) => {
        console.error("Transaction submission failed", error);
        setSubmissionPending(false);
      });
  }, [requestRedeemExtrinsic, api, xlmVaultId, activeAccount?.address, activeSigner, getRedeemRequest]);

  
  async function handleRedeem() {
    const res = await submitRequestRedeemExtrinsic()
    console.log(res)
  }
  
  return (
    <Box>
      Test Redeem
      <ButtonPrimary width="40%" onClick={() => handleRedeem()} disabled={submissionPending || !address}>{submissionPending ? <ButtonLoadingSpinner /> : "REDEEM"}</ButtonPrimary>
    </Box>
  );
}

export function getErrors(events: EventRecord[], api: any) {
  return (
    events
      .filter(({ event }) => api.events.system.ExtrinsicFailed.is(event))
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
            return error.toString();
          }
        },
      )
  );
}
