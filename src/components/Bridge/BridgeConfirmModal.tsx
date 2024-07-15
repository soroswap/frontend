import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { Asset } from '@stellar/stellar-sdk';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Info } from 'react-feather';
import { Box, Modal, Typography, useTheme } from 'soroswap-ui';

import { nativePendulumToDecimal, nativeStellarToDecimal } from 'helpers/bridge/pendulum/spacewalk';
import { useGetBridgeAssetInfo } from 'hooks/bridge/pendulum/useGetBridgeAssetInfo';
import { useSpacewalkFees } from 'hooks/bridge/pendulum/useSpacewalkFees';
import { UseBooleanReturnProps } from 'hooks/useBoolean';

import { ButtonPrimary } from 'components/Buttons/Button';
import { CloseButton } from 'components/Buttons/CloseButton';
import { AutoColumn } from 'components/Column';
import CopyTxHash from 'components/CopyTxHash/CopyTxHash';
import { DetailRowValue } from 'components/Liquidity/Add/AddModalFooter';
import { Label } from 'components/Liquidity/Add/AddModalHeader';
import {
  AnimatedEntranceConfirmationIcon,
  LoadingIndicatorOverlay,
} from 'components/Swap/PendingModalContent/Logos';
import { ButtonText, SubHeaderLarge, SubHeaderSmall } from 'components/Text';
import { MouseoverTooltip } from 'components/Tooltip';
import { ConfirmedIcon } from 'components/TransactionConfirmationModal/ModalStyles';
import { Step, StepContent, StepLabel, Stepper } from 'soroswap-ui';
import BridgeAssetItem from './BridgeAssetItem';
import { BridgeChains } from './BridgeComponent';
import { ModalContentWrapper } from './BridgeSelector';
import {
  IssueStepsByKeys,
  RedeemStepsByKeys,
  StepKeys,
  StepType,
  StepsProps,
  allSteps,
} from './BridgeSteps';
interface BridgeStepperProps {
  steps: any;
  activeStep: number;
  stepsData: StepsProps;
}

const BridgeStepper = (props: BridgeStepperProps) => {
  const { activeStep, steps, stepsData } = props;
  return (
    <>
      <Box textAlign={'end'}>
        <CloseButton onClick={stepsData.onCloseConfirmModal} />
      </Box>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps?.map((step: any) => {
          const labelProps: {
            optional?: React.ReactNode;
            error?: boolean;
          } = {};
          if (
            (stepsData.isError && step.key === StepKeys.RESULT) ||
            (stepsData.isError &&
              stepsData.selectedChainFrom === 'Stellar' &&
              step.key === StepKeys.SIGN_TX) ||
            (stepsData.isError &&
              stepsData.selectedChainFrom === 'Pendulum' &&
              step.key === StepKeys.SIGN_RQ)
          ) {
            labelProps.optional = (
              <Typography variant="caption" color="error">
                Alert message
              </Typography>
            );
            labelProps.error = true;
          }
          return (
            <Step key={step.key}>
              <StepLabel {...labelProps}>{step.label}</StepLabel>
              <StepContent>
                <Box sx={{ pr: 4 }}>
                  {stepsData && step.key === StepKeys.REVIEW && (
                    <>
                      <Box mt={3}>
                        <Typography variant="h6">From {stepsData.selectedChainFrom}</Typography>

                        <Box display="flex" gap={1}>
                          <div> {stepsData.amount}</div>
                          <BridgeAssetItem
                            asset={stepsData.selectedAsset}
                            chain={stepsData.selectedChainFrom}
                            flexDirection="row-reverse"
                          />
                        </Box>
                      </Box>

                      <Box mt={3}>
                        <Typography variant="h6">To {stepsData.selectedChainTo}</Typography>

                        <Box display="flex" gap={1}>
                          <div> {stepsData.amount}</div>
                          <BridgeAssetItem
                            asset={stepsData.selectedAsset}
                            chain={stepsData.selectedChainTo}
                            flexDirection="row-reverse"
                          />
                        </Box>
                      </Box>

                      <Box
                        mt={3}
                        pt={3}
                        borderTop={(theme) => `1px solid ${theme.palette.divider}`}
                      >
                        <Box display="flex" justifyContent="space-between" gap={1}>
                          <MouseoverTooltip
                            title="Currently zero fee, transitioning to 0.1% per transaction soon."
                            placement="top"
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Info size={14} color={stepsData.theme.palette.text.secondary} />
                              <Label>Bridge fee:</Label>
                            </Box>
                          </MouseoverTooltip>

                          <DetailRowValue>
                            {stepsData.bridgeFee.toString()} {stepsData.assetInfo.code}
                          </DetailRowValue>
                        </Box>
                        <Box display="flex" justifyContent="space-between" gap={1}>
                          <Label>Security deposit:</Label>
                          <DetailRowValue>
                            {stepsData.griefingCollateral.toString()} PEN
                          </DetailRowValue>
                        </Box>
                        <Box display="flex" justifyContent="space-between" gap={1}>
                          <Label>Transaction fee:</Label>
                          <DetailRowValue>{Number(stepsData.txFee).toFixed(12)} PEN</DetailRowValue>
                        </Box>
                      </Box>

                      <ButtonPrimary sx={{ mt: 3 }} onClick={stepsData.onClickConfirmButton}>
                        <ButtonText>Confirm</ButtonText>
                      </ButtonPrimary>
                    </>
                  )}
                  {stepsData && step.key === StepKeys.SIGN_RQ && (
                    <Box sx={{ pt: 4 }}>
                      <ConfirmedIcon>
                        <LoadingIndicatorOverlay />
                      </ConfirmedIcon>
                      <AutoColumn gap="12px" sx={{ mt: 4 }} justify="center">
                        <SubHeaderLarge color="textPrimary" textAlign="center">
                          Waiting for confirmation
                        </SubHeaderLarge>
                        <Box textAlign="center">
                          <Typography color="textSecondary">
                            {' '}
                            Request{' '}
                            {stepsData.selectedChainFrom == 'Stellar' ? 'Issue ' : 'Reedem '}
                          </Typography>
                          <Box display="flex" gap={1}>
                            <div>{stepsData.amount}</div>
                            <BridgeAssetItem
                              asset={stepsData.selectedAsset}
                              chain={stepsData.selectedChainFrom}
                              flexDirection="row-reverse"
                            />
                            <div>to {stepsData.amount}</div>
                            <BridgeAssetItem
                              asset={stepsData.selectedAsset}
                              chain={stepsData.selectedChainTo}
                              flexDirection="row-reverse"
                            />
                          </Box>
                          <Typography color="textSecondary">
                            from {stepsData.selectedChainFrom} to {stepsData.selectedChainTo}
                          </Typography>
                        </Box>
                        <SubHeaderSmall
                          color="textSecondary"
                          textAlign="center"
                          marginBottom="12px"
                        >
                          Confirm this transaction in your Pendulum wallet and await for chain
                          confirmation.
                        </SubHeaderSmall>
                      </AutoColumn>
                    </Box>
                  )}
                  {stepsData && step.key === StepKeys.SIGN_TX && (
                    <Box sx={{ mt: 4 }}>
                      <ConfirmedIcon>
                        <LoadingIndicatorOverlay />
                      </ConfirmedIcon>
                      <AutoColumn gap="12px" sx={{ mt: 2 }} justify="center">
                        <SubHeaderLarge color="textPrimary" textAlign="center">
                          Waiting for {stepsData.selectedChainFrom} confirmation
                        </SubHeaderLarge>
                        <Box textAlign="center">
                          <Typography variant="body2" color="textSecondary" marginBottom="12px">
                            Review and confirm this transaction in your Stellar wallet and await for
                            chain confirmation.
                          </Typography>
                        </Box>
                      </AutoColumn>
                    </Box>
                  )}
                  {stepsData && step.key === StepKeys.RESULT && (
                    <Box>
                      <Box textAlign={'center'} sx={{ my: 2 }}>
                        {stepsData.isSuccess ? (
                          <AnimatedEntranceConfirmationIcon />
                        ) : (
                          stepsData.isError &&
                          stepsData.errorMessage && (
                            <AlertTriangle
                              strokeWidth={2}
                              color={stepsData.theme.palette.error.main}
                              size="56px"
                            />
                          )
                        )}
                      </Box>
                      <SubHeaderLarge color="textPrimary" textAlign="center">
                        {stepsData.isSuccess
                          ? 'Transaction completed'
                          : stepsData.isError && 'Transaction failed'}
                      </SubHeaderLarge>
                      <AutoColumn gap="16px" sx={{ mt: 2, mb: 2 }} justify="center">
                        <Box textAlign="center">
                          <Typography color="textSecondary">
                            {stepsData.isSuccess ? 'Successfully' : 'We were unable to'}
                            {stepsData.selectedChainFrom == 'Stellar' ? ' issue ' : ' redeem '}
                          </Typography>
                          <Box display="flex" gap={1}>
                            <div> {stepsData.amount}</div>
                            <BridgeAssetItem
                              asset={stepsData.selectedAsset}
                              chain={stepsData.selectedChainFrom}
                              flexDirection="row-reverse"
                            />
                            <div>to {stepsData.amount} </div>
                            <BridgeAssetItem
                              asset={stepsData.selectedAsset}
                              chain={stepsData.selectedChainTo}
                              flexDirection="row-reverse"
                            />
                          </Box>
                          <Typography color="textSecondary">
                            from {stepsData.selectedChainFrom} to {stepsData.selectedChainTo}.
                          </Typography>
                        </Box>

                        {stepsData.isError && stepsData.errorMessage && (
                          <Box>
                            <SubHeaderSmall
                              color="textSecondary"
                              textAlign="center"
                              marginBottom="12px"
                            >
                              {stepsData.errorMessage}
                            </SubHeaderSmall>
                            {stepsData.tryAgain && stepsData.tryAgain.show ? (
                              <ButtonPrimary onClick={stepsData.tryAgain.fn}>
                                Try again
                              </ButtonPrimary>
                            ) : null}
                          </Box>
                        )}
                        {stepsData.txHash && (
                          <Box>
                            <CopyTxHash txHash={stepsData.txHash} />
                          </Box>
                        )}
                      </AutoColumn>
                    </Box>
                  )}
                </Box>
              </StepContent>
            </Step>
          );
        })}
      </Stepper>
    </>
  );
};

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
    txHash,
    extrinsic,
    errorMessage,
    tryAgain,
    stepper,
  } = props;

  const [txFee, setTxFee] = useState<BigNumber>(new BigNumber(0));
  const assetInfo = useGetBridgeAssetInfo({ asset: selectedAsset, chain: selectedChainFrom });
  const { getTransactionFee, getFees } = useSpacewalkFees();
  const fees = getFees();
  const theme = useTheme();
  const { activeStep, setActiveStep } = stepper;

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

  const stepsProps: StepsProps = {
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
    isPending,
    onClickConfirmButton,
    onCloseConfirmModal,
    setActiveStep,
  };

  const [steps, setSteps] = useState<StepType[] | null>(null);

  const redeemSteps: StepType[] = useMemo(() => {
    const redeemStepKeys = Object.keys(RedeemStepsByKeys);
    return allSteps.filter((step: any) => redeemStepKeys.includes(step.key));
  }, [allSteps]);

  const issueSteps: StepType[] = useMemo(() => {
    const StepKeys = Object.keys(IssueStepsByKeys);
    return allSteps.filter((step: any) => StepKeys.includes(step.key));
  }, [allSteps]);

  useEffect(() => {
    if (selectedChainFrom === 'Stellar') {
      setSteps(issueSteps);
    } else if (selectedChainFrom === 'Pendulum') {
      setSteps(redeemSteps);
    }
  }, [selectedChainFrom, selectedChainTo, issueSteps, redeemSteps]);

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
      setActiveStep(steps && steps.length - 1);
    }
  }, [isSuccess, steps, setActiveStep]);

  useEffect(() => {
    if (isError) {
      setActiveStep(steps && steps.length - 1);
    }
  }, [isError, steps, setActiveStep]);

  return (
    <Modal open={confirmModal.value} onClose={onCloseConfirmModal}>
      <ModalContentWrapper sx={{ p: 3 }} modalheight="auto">
        <BridgeStepper steps={steps} stepsData={stepsProps} activeStep={activeStep} />
      </ModalContentWrapper>
    </Modal>
  );
};

export default BridgeConfirmModal;
