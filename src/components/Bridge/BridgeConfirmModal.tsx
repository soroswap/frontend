import {
  AnimatedEntranceConfirmationIcon,
  LoadingIndicatorOverlay,
} from 'components/Swap/PendingModalContent/Logos';
import { AlertTriangle } from 'react-feather';
import { Asset } from 'stellar-sdk';
import { AutoColumn } from 'components/Column';
import { Box, Modal, Typography, useTheme } from '@mui/material';
import { BridgeChains } from './BridgeComponentNew';
import { ButtonPrimary } from 'components/Buttons/Button';
import { ButtonText, SubHeader, SubHeaderLarge, SubHeaderSmall } from 'components/Text';
import { CloseButton } from 'components/Buttons/CloseButton';
import { ConfirmedIcon } from 'components/TransactionConfirmationModal/ModalStyles';
import { DetailRowValue } from 'components/Liquidity/Add/AddModalFooter';
import { Label } from 'components/Liquidity/Add/AddModalHeader';
import { ModalContentWrapper } from './BridgeSelector';
import { RowBetween } from 'components/Row';
import { UseBooleanReturnProps } from 'hooks/useBoolean';
import { useGetBridgeAssetInfo } from 'hooks/bridge/pendulum/useGetBridgeAssetInfo';
import BridgeAssetItem from './BridgeAssetItem';
import CopyTxHash from 'components/CopyTxHash/CopyTxHash';

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
  } = props;

  const theme = useTheme();

  const assetInfo = useGetBridgeAssetInfo({ asset: selectedAsset, chain: selectedChainFrom });

  const getSecurityDeposit = () => {
    return Number(amount) * 0.005;
  };

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
                <DetailRowValue>0 {assetInfo.code}</DetailRowValue>
              </Box>
              <Box display="flex" justifyContent="space-between" gap={1}>
                <Label>Security deposit:</Label>
                <DetailRowValue>{getSecurityDeposit()} PEN</DetailRowValue>
              </Box>
              <Box display="flex" justifyContent="space-between" gap={1}>
                <Label>Transaction fee:</Label>
                <DetailRowValue>0 PEN</DetailRowValue>
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
