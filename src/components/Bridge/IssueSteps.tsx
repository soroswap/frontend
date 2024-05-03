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
}

export interface IssueSteps {
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

export function issueSteps(props: IssueSteps) {
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
    onCloseConfirmModal,
    setActiveStep,
  } = props;
  const steps: Step[] = [
    {
      label: 'Review your transaction',
      body: (
        <>
          <RowBetween>
            <SubHeader>Confirm Bridge</SubHeader>
          </RowBetween>
  
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
    },
    {
      label: 'Sign Issue Request in your Wallet',
      body: (
        <>
          <ConfirmedIcon>
            <LoadingIndicatorOverlay />
          </ConfirmedIcon>
          <AutoColumn gap="12px" sx={{ mt: 2 }} justify="center">
            <SubHeaderLarge color="textPrimary" textAlign="center">
              Waiting for confirmation
            </SubHeaderLarge>
            <Box textAlign="center">
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
              <Typography variant="body2">
                From {selectedChainFrom} to {selectedChainTo}
              </Typography>
            </Box>
            <SubHeaderSmall color="textSecondary" textAlign="center" marginBottom="12px">
              Confirm this transaction in your wallet
            </SubHeaderSmall>
          </AutoColumn>
        </>
      )
    },
    {
      label: 'Sign the transaction in your wallet',
      body: (
        <>
          <ConfirmedIcon>
            <LoadingIndicatorOverlay />
          </ConfirmedIcon>
          <AutoColumn gap="12px" sx={{ mt: 2 }} justify="center">
            <SubHeaderLarge color="textPrimary" textAlign="center">
              Waiting for confirmation
            </SubHeaderLarge>
  
            <Box textAlign="center">
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
              <Typography variant="body2">
                From {selectedChainFrom} to {selectedChainTo}
              </Typography>
            </Box>
  
            {isSuccess ? null : isError && errorMessage ? (
              <Box>
                <SubHeaderSmall color="textSecondary" textAlign="center" marginBottom="12px">
                  {errorMessage}
                </SubHeaderSmall>
                {tryAgain && tryAgain.show ? (
                  <ButtonPrimary onClick={tryAgain.fn}>Try again</ButtonPrimary>
                ) : null}
              </Box>
            ) : (
              <SubHeaderSmall color="textSecondary" textAlign="center" marginBottom="12px">
                Confirm this transaction in your wallet
              </SubHeaderSmall>
            )}
  
            {txHash && (
              <Box>
                <CopyTxHash txHash={txHash} />
              </Box>
            )}
          </AutoColumn>
        </>
      )
    },
    {
      label: 'Result',
      body: (
        <>
          <Box textAlign={'center'}>
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
              <Typography variant="body2">
                From {selectedChainFrom} to {selectedChainTo}
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
        </>
      )
    }
  ];
  return (
    steps
  )
}