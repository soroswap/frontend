import { Box, Button, Modal, Typography, useTheme } from '@mui/material';
import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import BigNumber from 'bignumber.js';

import { nativePendulumToDecimal, nativeStellarToDecimal } from 'helpers/bridge/pendulum/spacewalk';
import { useGetBridgeAssetInfo } from 'hooks/bridge/pendulum/useGetBridgeAssetInfo';
import { useSpacewalkFees } from 'hooks/bridge/pendulum/useSpacewalkFees';
import { UseBooleanReturnProps } from 'hooks/useBoolean';
import { useEffect, useMemo, useState } from 'react';

import { Asset } from 'stellar-sdk';

import { BridgeChains } from './BridgeComponent';
import { ModalContentWrapper } from './BridgeSelector';

import {Stepper, Step, StepLabel, StepContent} from '@mui/material';

import { IssueStepsProps, issueSteps } from './IssueSteps';

import { CloseButton } from 'components/Buttons/CloseButton';

import { IssueStepKeys, IssueStepsByKeys, RedeemStepsByKeys } from './IssueSteps';

interface BridgeStepperProps {
  steps: any;
  activeStep: number;
  onCloseConfirmModal: () => void;
}
export function BridgeStepper(props: BridgeStepperProps) {
  const {activeStep, steps, onCloseConfirmModal} = props;
  return (
    <ModalContentWrapper sx={{ p: 3 }} modalheight="auto">
      <Box textAlign={'end'}>
        <CloseButton onClick={onCloseConfirmModal} />
      </Box>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step: any) => (
          <Step key={step.key}>
            <StepLabel>
              {step.label}
            </StepLabel>
            <StepContent>
              <Box sx={{pr:4}}>
                {step.body}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </ModalContentWrapper>
  );
}

interface Props {
  confirmModal: UseBooleanReturnProps;
  onCloseConfirmModal: () => void;
  showPendingModal: boolean;
  isSuccess: boolean;
  isError: boolean;
  isPending: boolean;
  txHash: string | undefined;
  selectedChainFrom: BridgeChains | null;
  selectedChainTo: BridgeChains | null;
  selectedAsset: Asset | undefined;
  amount: string;
  onClickConfirmButton: () => void;
  extrinsic?: SubmittableExtrinsic;
  errorMessage?: string;
  tryAgain?: { show: boolean; fn: any };
  stepper: any;
}

const BridgeConfirmModal = (props: Props) => {
  const {
    amount,
    confirmModal,
    isError,
    isPending,
    isSuccess,
    onClickConfirmButton,
    onCloseConfirmModal,
    selectedAsset,
    selectedChainFrom,
    selectedChainTo,
    showPendingModal,
    txHash,
    extrinsic,
    errorMessage,
    tryAgain,
    stepper
  } = props;

  const [txFee, setTxFee] = useState<BigNumber>(new BigNumber(0));
  const assetInfo = useGetBridgeAssetInfo({ asset: selectedAsset, chain: selectedChainFrom });
  const { getTransactionFee, getFees } = useSpacewalkFees();
  const fees = getFees();
  const theme = useTheme();
  const {activeStep, setActiveStep} = stepper;

  const bridgeFee = useMemo(() => {
    return nativeStellarToDecimal(
      new BigNumber(amount).multipliedBy(
        selectedChainFrom === 'Stellar' ? fees.issueFee : fees.redeemFee,
      ),
    );
  }, [amount, fees.issueFee, fees.redeemFee, selectedChainFrom]);

  const griefingCollateral = useMemo(() => {
    return nativeStellarToDecimal(
      new BigNumber(amount).shiftedBy(12).multipliedBy(fees.issueGriefingCollateral),
    );
  }, [amount, fees]);
  const stepsProps: IssueStepsProps = {
      amount,
      assetInfo,
      bridgeFee,
      errorMessage,
      griefingCollateral,
      isError,
      isSuccess,
      selectedAsset,
      selectedChainFrom,
      selectedChainTo,
      theme,
      txFee,
      tryAgain,
      txHash,
      onClickConfirmButton,
      onCloseConfirmModal,
      setActiveStep
  }

  const allSteps = issueSteps(stepsProps);

  const [steps, setSteps] = useState(allSteps);
  const redeemSteps = useMemo(() => {
    const redeemStepKeys = Object.keys(RedeemStepsByKeys);
    return allSteps.filter((step: any) => redeemStepKeys.includes(step.key));
  }, [allSteps]);

  useEffect(() => {
    if(selectedChainFrom === 'Stellar') {
      setSteps(issueSteps(stepsProps));
    } else if (selectedChainFrom === 'Pendulum') {
      setSteps(redeemSteps);
    }
  }, [selectedChainFrom, selectedChainTo]);

  useEffect(() => {
    if (!extrinsic) {
      return;
    }
    getTransactionFee(extrinsic).then((fee: BigNumber) => {
      setTxFee(nativePendulumToDecimal(fee));
    });
  }, [extrinsic, getTransactionFee, setTxFee]);
  
  useEffect(() => {
    if (isSuccess) {
      setActiveStep(steps.length - 1);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      setActiveStep(steps.length - 1);
    }
  }, [isError]);

  return (
    <Modal open={confirmModal.value} onClose={onCloseConfirmModal}>
      <>
        <BridgeStepper steps={steps} activeStep={activeStep} onCloseConfirmModal={onCloseConfirmModal}/>
      </>
    </Modal>
  );
};

export default BridgeConfirmModal;
