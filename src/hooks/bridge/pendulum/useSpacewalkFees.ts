// import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
// import { SpacewalkPrimitivesCurrencyId } from '@polkadot/types/lookup';
// import Big from 'big.js';
// import { useEffect, useMemo, useState } from 'preact/hooks';
// import { useNodeInfoState } from '../../NodeInfoProvider';
// import { fixedPointToDecimal } from '../../shared/parseNumbers/metric';
import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { Codec } from "@polkadot/types/types";
import { useInkathon } from "@scio-labs/use-inkathon";
import BigNumber from "bignumber.js";
import { fixedPointToDecimal } from "helpers/bridge/pendulum/spacewalk";
import { useEffect, useMemo, useState } from "react";

export function useSpacewalkFees() {
  const [issueFee, setIssueFee] = useState<BigNumber>(new BigNumber(0));
  const [redeemFee, setRedeemFee] = useState<BigNumber>(new BigNumber(0));
  const [punishmentFee, setPunishmentFee] = useState<BigNumber>(new BigNumber(0));
  const [premiumRedeemFee, setPremiumRedeemFee] = useState<BigNumber>(new BigNumber(0));
  const [issueGriefingCollateral, setIssueGriefingCollateral] = useState<BigNumber>(new BigNumber(0));
  const [replaceGriefingCollateral, setReplaceGriefingCollateral] = useState<BigNumber>(new BigNumber(0));

  const [griefingCollateralCurrency, setGriefingCollateralCurrency] = useState<
    Codec | undefined
  >(undefined);

  const { api } = useInkathon();

  useEffect(() => {
    if (!api) {
      return;
    }

    // Check that the pallet is available
    if (!api.query.fee || !api.consts.vaultRegistry) {
      return;
    }

    let unsubscribe: () => void = () => undefined;

    setGriefingCollateralCurrency(api.consts.vaultRegistry?.getGriefingCollateralCurrencyId);

    Promise.all([
      api.query.fee.issueFee((fee: string) => {
        const decimal = fixedPointToDecimal(fee.toString());
        setIssueFee(decimal);
      }),
      api.query.fee.punishmentFee((fee: string) => {
        const decimal = fixedPointToDecimal(fee.toString());
        setPunishmentFee(decimal);
      }),
      api.query.fee.redeemFee((fee: string) => {
        const decimal = fixedPointToDecimal(fee.toString());
        setRedeemFee(decimal);
      }),
      api.query.fee.premiumRedeemFee((fee: string) => {
        const decimal = fixedPointToDecimal(fee.toString());
        setPremiumRedeemFee(decimal);
      }),
      api.query.fee.issueGriefingCollateral((fee: string) => {
        const decimal = fixedPointToDecimal(fee.toString());
        setIssueGriefingCollateral(decimal);
      }),
      api.query.fee.replaceGriefingCollateral((fee: string) => {
        const decimal = fixedPointToDecimal(fee.toString());
        setReplaceGriefingCollateral(decimal);
      }),
    ]).then((unsubscribeFunctions) => {
      unsubscribe = () => {
        //@ts-ignore
        unsubscribeFunctions.forEach((u) => u());
      };
    });

    return unsubscribe;
  }, [api]);

  const memo = useMemo(() => {
    return {
      getFees() {
        return {
          issueFee,
          redeemFee,
          punishmentFee,
          premiumRedeemFee,
          issueGriefingCollateral,
          replaceGriefingCollateral,
          griefingCollateralCurrency,
        };
      },
      async getTransactionFee(extrinsic: SubmittableExtrinsic) {
        if (!api || !extrinsic.hasPaymentInfo) {
          return new BigNumber(0);
        }

        // Can be any address because we don't care about executing it here
        const dummyAddress = '5D4tzEZy9XeNSwsAXgtZrRrs1bTfpPTWGqwb1PwCYjRTKYYS';
        const sender = dummyAddress;
        const info = await extrinsic.paymentInfo(sender);

        return new BigNumber(info.partialFee.toString());
      },
    };
  }, [
    api,
    issueFee,
    redeemFee,
    punishmentFee,
    premiumRedeemFee,
    issueGriefingCollateral,
    replaceGriefingCollateral,
    griefingCollateralCurrency,
  ]);

  return memo;
}