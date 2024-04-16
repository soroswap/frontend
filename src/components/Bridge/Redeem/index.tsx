import { Box, TextField } from "@mui/material";
import { useInkathon } from "@scio-labs/use-inkathon";
import { useSorobanReact } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { decimalToStellarNative, isPublicKey } from "helpers/bridge/pendulum/stellar";
import { getEventBySectionAndMethod, getSubstrateErrors } from "helpers/bridge/pendulum/substrate";
import { useRedeemPallet } from "hooks/bridge/pendulum/useRedeemPallet";
import useSpacewalkBridge from "hooks/bridge/pendulum/useSpacewalkBridge";
import { useCallback, useMemo, useState } from "react";
import { BridgeButton } from "../BridgeButton";

export type RedeemFormValues = {
  amount: number;
  to: string;
};

export function RedeemComponent() {
  const { activeAccount, activeSigner, api } = useInkathon();
  const { createRedeemRequestExtrinsic, getRedeemRequest } = useRedeemPallet();
  const { address } = useSorobanReact();
  const { selectedVault } = useSpacewalkBridge()
  const [submissionPending, setSubmissionPending] = useState(false);
  const [amount, setAmount] = useState<string>('');

  const amountRaw = useMemo(() => {
    return amount ? decimalToStellarNative(amount).toString() : new BigNumber(0).toString();
  }, [amount]);
  const stellarAddress = address;
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
      console.log("Error: No Polkadot wallet connected");
      return;
    }

    setSubmissionPending(true);

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
  }, [requestRedeemExtrinsic, api, selectedVault, activeAccount?.address, activeSigner, getRedeemRequest]);

  
  async function handleRedeem() {
    const res = await submitRequestRedeemExtrinsic()
    console.log(res)
  }
  
  return (
    <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* <Box mb={2}>
        <Select value={selectedNetwork} onChange={(e) => setSelectedNetwork(e.target.value)}>
          {availableNetworks.map((chain) => (
            <MenuItem key={chain} value={chain}>
              {chain}
            </MenuItem>
          ))}
        </Select>
      </Box> */}
      <TextField
        label="Amount to Bridge back to Stellar"
        variant="outlined"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        fullWidth
        type="number"
      />
      <Box>
        You will receive: {amount} XLM
      </Box>
      <BridgeButton isLoading={submissionPending} callback={handleRedeem} />
    </Box>
  );
}
