import { ButtonPrimary } from 'components/Buttons/Button';

import { AutoColumn } from 'components/Column';
import CopyTxHash from 'components/CopyTxHash/CopyTxHash';
import { DetailRowValue } from 'components/Liquidity/Add/AddModalFooter';
import { Label } from 'components/Liquidity/Add/AddModalHeader';
import { RowBetween } from 'components/Row';
import {
  AnimatedEntranceConfirmationIcon,
  LoadingIndicatorOverlay,
} from 'components/Swap/PendingModalContent/Logos';
import { ButtonText, SubHeader, SubHeaderLarge, SubHeaderSmall } from 'components/Text';
import { ConfirmedIcon } from 'components/TransactionConfirmationModal/ModalStyles';

import { AlertTriangle, Info } from 'react-feather';

import BridgeAssetItem from './BridgeAssetItem';

import { MouseoverTooltip } from 'components/Tooltip';

import { Box, Typography } from '@mui/material';

import { BridgeChains } from './BridgeComponent';
import { Asset } from 'stellar-sdk';

import BigNumber from 'bignumber.js';

interface Step {
  label: string;
  body: JSX.Element | Element;
  key?: string;
}

export enum IssueStepKeys {
  REVIEW = 'review',
  SIGN_RQ = 'sign_rq',
  SIGN_TX = 'sign_tx',
  RESULT = 'res'
}

export enum RedeemStepKeys {
  REVIEW = 'review',
  SIGN_RQ = 'sign_rq',
  RESULT = 'res'
}

export const IssueStepsByKeys: Record<IssueStepKeys, number> = {
  [IssueStepKeys.REVIEW]: 0,
  [IssueStepKeys.SIGN_RQ]: 1,
  [IssueStepKeys.SIGN_TX]: 2,
  [IssueStepKeys.RESULT]: 3
};

export const RedeemStepsByKeys: Record<RedeemStepKeys, number> = {
  [IssueStepKeys.REVIEW]: 0,
  [IssueStepKeys.SIGN_RQ]: 1,
  [IssueStepKeys.RESULT]: 3
};

export interface IssueStepsProps {
  amount: string;
  assetInfo: any;
  bridgeFee: any;
  errorMessage?: string;
  griefingCollateral: any;
  isError: boolean;
  isSuccess: boolean;
  selectedAsset: Asset | undefined;
  selectedChainFrom: BridgeChains | null;
  selectedChainTo: BridgeChains | null;
  theme: any;
  txFee: BigNumber;
  tryAgain?: { show: boolean; fn: any };
  txHash: string | undefined;
  onClickConfirmButton: () => void;
  onCloseConfirmModal: () => void;
  setActiveStep: (step: number) => void;
}

export function issueSteps(props: IssueStepsProps) {
  const { 
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
  } = props; 
  const steps: Step[] = [
    {
      label: 'Review your transaction',
      body: (
        <>
          <Box mt={3}>
            <Typography variant="h6">From {selectedChainFrom}</Typography>
  
            <Box display="flex" gap={1}>
              <div> {amount}</div>
              <BridgeAssetItem
                asset={selectedAsset}
                chain={selectedChainFrom}
                flexDirection="row-reverse"
              />
            </Box>
          </Box>
  
          <Box mt={3}>
            <Typography variant="h6">To {selectedChainTo}</Typography>
  
            <Box display="flex" gap={1}>
              <div> {amount}</div>
              <BridgeAssetItem
                asset={selectedAsset}
                chain={selectedChainTo}
                flexDirection="row-reverse"
              />
            </Box>
          </Box>
  
          <Box mt={3} pt={3} borderTop={(theme) => `1px solid ${theme.palette.divider}`}>
            <Box display="flex" justifyContent="space-between" gap={1}>
              <MouseoverTooltip
                title="Currently zero fee, transitioning to 0.1% per transaction soon."
                placement="top"
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Info size={14} color={theme.palette.text.secondary} />
                  <Label>Bridge fee:</Label>
                </Box>
              </MouseoverTooltip>
  
              <DetailRowValue>
                {bridgeFee.toString()} {assetInfo.code}
              </DetailRowValue>
            </Box>
            <Box display="flex" justifyContent="space-between" gap={1}>
              <Label>Security deposit:</Label>
              <DetailRowValue>{griefingCollateral.toString()} PEN</DetailRowValue>
            </Box>
            <Box display="flex" justifyContent="space-between" gap={1}>
              <Label>Transaction fee:</Label>
              <DetailRowValue>{Number(txFee).toFixed(12)} PEN</DetailRowValue>
            </Box>
          </Box>
  
          {/* <ButtonPrimary sx={{ mt: 3 }} onClick={onClickConfirmButton}> */}
          <ButtonPrimary sx={{ mt: 3 }} onClick={onClickConfirmButton}>
            <ButtonText>Confirm</ButtonText>
          </ButtonPrimary>
        </>
      ),
      key: IssueStepKeys.REVIEW
    },
    {
      label: `Approve in your Pendulum wallet`,
      body: (
        <Box sx={{pt:4}}>
          <ConfirmedIcon>
            <LoadingIndicatorOverlay />
          </ConfirmedIcon>
          <AutoColumn gap="12px" sx={{ mt: 4 }} justify="center">
            <SubHeaderLarge color="textPrimary" textAlign="center">
              Waiting for confirmation
            </SubHeaderLarge>
            <Box textAlign="center">
              <Typography color="textSecondary"> Request {selectedChainFrom == 'Stellar' ? 'Issue ' : 'Reedem '}</Typography>
              <Box display="flex" gap={1}>
                <div>{amount}</div>
                <BridgeAssetItem
                  asset={selectedAsset}
                  chain={selectedChainFrom}
                  flexDirection="row-reverse"
                />
                <div>to {amount}</div>
                <BridgeAssetItem
                  asset={selectedAsset}
                  chain={selectedChainTo}
                  flexDirection="row-reverse"
                />

              </Box>
              <Typography color="textSecondary">
                from {selectedChainFrom} to {selectedChainTo}
              </Typography>
            </Box>
            <SubHeaderSmall color="textSecondary" textAlign="center" marginBottom="12px">
              Confirm this transaction in your Pendulum wallet and await for chain confirmation.
            </SubHeaderSmall>
          </AutoColumn>
        </Box>
      ),
      key: IssueStepKeys.SIGN_RQ
    },
    {
      label: 'Transfer your assets from Stellar',
      body: (
        <Box sx={{mt: 4}}>
          <ConfirmedIcon>
            <LoadingIndicatorOverlay />
          </ConfirmedIcon>
          <AutoColumn gap="12px" sx={{ mt: 2 }} justify="center">
            <SubHeaderLarge color="textPrimary" textAlign="center">
              Waiting for {selectedChainFrom} confirmation
            </SubHeaderLarge>
            <Box textAlign="center">
            <Typography variant="body2" color="textSecondary" marginBottom="12px">
                Review and confirm this transaction in your Stellar wallet and await for chain confirmation.
              </Typography>
            </Box>
          </AutoColumn>
        </Box>
      ),
      key: IssueStepKeys.SIGN_TX
    },
    {
      label: 'Result',
      body: (
        <Box>
          <Box textAlign={'center'} sx={{my:2}}>
            {isSuccess ? (
              <AnimatedEntranceConfirmationIcon />
            ) : (isError && errorMessage) && (
              <AlertTriangle strokeWidth={2} color={theme.palette.error.main} size="56px" />
            )}
          </Box>
          <SubHeaderLarge color="textPrimary" textAlign="center">
            {isSuccess ? 'Transaction completed': isError && 'Transaction failed'}
          </SubHeaderLarge>
          <AutoColumn gap="16px" sx={{ mt: 2, mb: 2 }} justify="center">
            <Box textAlign="center">
              <Typography color="textSecondary">
                {isSuccess ? 'Successfully' : 'We were unable to'}
                {selectedChainFrom == 'Stellar' ? ' issue ' : ' redeem '}
              </Typography>
              <Box display="flex" gap={1}>
                <div> {amount}</div>
                <BridgeAssetItem
                  asset={selectedAsset}
                  chain={selectedChainFrom}
                  flexDirection="row-reverse"
                />
                <div>to {amount} </div>
                <BridgeAssetItem
                  asset={selectedAsset}
                  chain={selectedChainTo}
                  flexDirection="row-reverse"
                />
              </Box>
              <Typography color="textSecondary">
                from {selectedChainFrom} to {selectedChainTo}.
              </Typography>
            </Box>
       
  
            {(isError && errorMessage) && (
              <Box>
                <SubHeaderSmall color="textSecondary" textAlign="center" marginBottom="12px">
                  {errorMessage}
                </SubHeaderSmall>
                {tryAgain && tryAgain.show ? (
                  <ButtonPrimary onClick={tryAgain.fn}>Try again</ButtonPrimary>
                ) : null}
              </Box>
            )}
            {txHash && (
              <Box>
                <CopyTxHash txHash={txHash} />
              </Box>
            )}
          </AutoColumn>
        </Box>
      ),
      key: IssueStepKeys.RESULT
    }
  ];
  return (
    steps
  )
}