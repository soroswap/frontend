// import { Asset } from '@stellar/stellar-sdk';
// import BigNumber from 'bignumber.js';
// import { BridgeChains } from './BridgeComponent';

// export interface StepType {
//   label: string;
//   key: string;
// }

// export enum StepKeys {
//   REVIEW = 'review',
//   SIGN_RQ = 'sign_rq',
//   SIGN_TX = 'sign_tx',
//   RESULT = 'res'
// }

// export enum RedeemStepKeys {
//   REVIEW = 'review',
//   SIGN_RQ = 'sign_rq',
//   RESULT = 'res'
// }

// export const IssueStepsByKeys: Record<StepKeys, number> = {
//   [StepKeys.REVIEW]: 0,
//   [StepKeys.SIGN_RQ]: 1,
//   [StepKeys.SIGN_TX]: 2,
//   [StepKeys.RESULT]: 3
// };

// export const RedeemStepsByKeys: Record<RedeemStepKeys, number> = {
//   [RedeemStepKeys.REVIEW]: 0,
//   [RedeemStepKeys.SIGN_RQ]: 1,
//   [RedeemStepKeys.RESULT]: 3
// };

// export interface StepsProps {
//   amount: string;
//   assetInfo: any;
//   bridgeFee: any;
//   errorMessage?: string;
//   griefingCollateral: any;
//   isError: boolean;
//   isSuccess: boolean;
//   selectedAsset: Asset | undefined;
//   selectedChainFrom: BridgeChains | null;
//   selectedChainTo: BridgeChains | null;
//   theme: any;
//   txFee: BigNumber;
//   tryAgain?: { show: boolean; fn: any };
//   txHash: string | undefined;
//   isPending: boolean;
//   onClickConfirmButton: () => void;
//   onCloseConfirmModal: () => void;
//   setActiveStep: (step: number) => void;
// }

// export const allSteps = [
//   {
//     label: 'Review your transaction',
//     key: StepKeys.REVIEW
//   },
//   {
//     label: `Approve in your Pendulum wallet`,
//     key: StepKeys.SIGN_RQ
//   },
//   {
//     label: 'Transfer your assets from Stellar',
//     key: StepKeys.SIGN_TX
//   },
//   {
//     label: 'Result',
//     key: StepKeys.RESULT
//   }
// ]

