import { Box, Modal, Typography, useTheme } from '@mui/material';
import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import BigNumber from 'bignumber.js';
import { ButtonPrimary } from 'components/Buttons/Button';
import { CloseButton } from 'components/Buttons/CloseButton';
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
import { nativePendulumToDecimal, nativeStellarToDecimal } from 'helpers/bridge/pendulum/spacewalk';
import { useGetBridgeAssetInfo } from 'hooks/bridge/pendulum/useGetBridgeAssetInfo';
import { useSpacewalkFees } from 'hooks/bridge/pendulum/useSpacewalkFees';
import { UseBooleanReturnProps } from 'hooks/useBoolean';
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'react-feather';
import { Asset } from 'stellar-sdk';
import BridgeAssetItem from './BridgeAssetItem';
import { BridgeChains } from './BridgeComponentNew';
import { ModalContentWrapper } from './BridgeSelector';

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
  extrinsic?: SubmittableExtrinsic
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
  } = props;

  const theme = useTheme();
  const { getTransactionFee, getFees } = useSpacewalkFees();
  const fees = getFees();

  const assetInfo = useGetBridgeAssetInfo({ asset: selectedAsset, chain: selectedChainFrom });

  const [txFee, setTxFee] = useState<BigNumber>(new BigNumber(0))
  
  useEffect(() => {
    if (!extrinsic) {
      return;
    }

    getTransactionFee(extrinsic).then((fee: BigNumber) => {
      setTxFee(nativePendulumToDecimal(fee));
    });
  }, [extrinsic, getTransactionFee, setTxFee]);
  
  const bridgeFee = useMemo(() => {
    return nativeStellarToDecimal((new BigNumber(amount)).multipliedBy(selectedChainFrom === "Stellar" ? fees.issueFee : fees.redeemFee));
  }, [amount, fees.issueFee, fees.redeemFee, selectedChainFrom]);

  const griefingCollateral = useMemo(() => {
    return nativeStellarToDecimal((new BigNumber(amount).shiftedBy(12)).multipliedBy(fees.issueGriefingCollateral));
  }, [amount, fees]);

  return (
    <Modal open={confirmModal.value} onClose={onCloseConfirmModal}>
      <div>
        {showPendingModal ? (
          <ModalContentWrapper sx={{ p: 3 }} modalheight="300px">
            <div>
              <RowBetween>
                <div />
                <CloseButton onClick={onCloseConfirmModal} />
              </RowBetween>

              <Box textAlign="center">
                {isSuccess ? (
                  <AnimatedEntranceConfirmationIcon />
                ) : isError ? (
                  <AlertTriangle strokeWidth={1} color={theme.palette.error.main} size="56px" />
                ) : (
                  <ConfirmedIcon>
                    <LoadingIndicatorOverlay />
                  </ConfirmedIcon>
                )}
              </Box>

              <AutoColumn gap="12px" sx={{ mt: 2 }} justify="center">
                <SubHeaderLarge color="textPrimary" textAlign="center">
                  {isSuccess
                    ? 'Transaction completed'
                    : isError
                    ? 'Transaction failed'
                    : 'Waiting for confirmation'}
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
                {isPending && !isSuccess && !isError && (
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
            </div>
          </ModalContentWrapper>
        ) : (
          <ModalContentWrapper sx={{ p: 3 }} modalheight="450px">
            <RowBetween>
              <SubHeader>Confirm Bridge</SubHeader>
              <CloseButton onClick={onCloseConfirmModal} />
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
                <Label>Bridge fee:</Label>
                <DetailRowValue>{bridgeFee.toString()} {assetInfo.code}</DetailRowValue>
              </Box>
              <Box display="flex" justifyContent="space-between" gap={1}>
                <Label>Security deposit:</Label>
                <DetailRowValue>{griefingCollateral.toString()} PEN</DetailRowValue>
              </Box>
              <Box display="flex" justifyContent="space-between" gap={1}>
                <Label>Transaction fee:</Label>
                <DetailRowValue>{txFee.toFixed(12)} PEN</DetailRowValue>
              </Box>
            </Box>

            <ButtonPrimary sx={{ mt: 3 }} onClick={onClickConfirmButton}>
              <ButtonText>Confirm</ButtonText>
            </ButtonPrimary>
          </ModalContentWrapper>
        )}
      </div>
    </Modal>
  );
};

export default BridgeConfirmModal;
