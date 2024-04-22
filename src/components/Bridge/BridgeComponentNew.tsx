import { Box, Modal, Typography, useTheme } from '@mui/material';
import { useInkathon } from '@scio-labs/use-inkathon';
import { ButtonPrimary } from 'components/Buttons/Button';
import { CloseButton } from 'components/Buttons/CloseButton';
import { AutoColumn } from 'components/Column';
import {
  Container,
  InputPanel,
  InputRow,
  StyledNumericalInput,
} from 'components/CurrencyInputPanel/SwapCurrencyInputPanel';
import { DetailRowValue } from 'components/Liquidity/Add/AddModalFooter';
import { Label } from 'components/Liquidity/Add/AddModalHeader';
import { RowBetween } from 'components/Row';
import {
  AnimatedEntranceConfirmationIcon,
  LoadingIndicatorOverlay,
} from 'components/Swap/PendingModalContent/Logos';
import { ArrowContainer, OutputSwapSection, SwapSection } from 'components/Swap/SwapComponent';
import { ArrowWrapper, SwapWrapper } from 'components/Swap/styleds';
import { ButtonText, SubHeader, SubHeaderLarge, SubHeaderSmall } from 'components/Text';
import { ConfirmedIcon } from 'components/TransactionConfirmationModal/ModalStyles';
import { useGetBridgeAssetInfo } from 'hooks/bridge/pendulum/useGetBridgeAssetInfo';
import useIssueHandler from 'hooks/bridge/pendulum/useIssueHandler';
import useReedemHandler from 'hooks/bridge/pendulum/useReedemHandler';
import useSpacewalkBalances from 'hooks/bridge/pendulum/useSpacewalkBalances';
import useSpacewalkBridge from 'hooks/bridge/pendulum/useSpacewalkBridge';
import useBoolean from 'hooks/useBoolean';
import { useState } from 'react';
import { AlertTriangle, ArrowDown } from 'react-feather';
import BridgeAssetItem from './BridgeAssetItem';
import { BridgeButton } from './BridgeButton';
import BridgeHeader from './BridgeHeader';
import BridgeSelector, { ModalContentWrapper } from './BridgeSelector';
import PendulumChainIcon from './ChainIcons/PendulumChainIcon';
import StellarChainIcon from './ChainIcons/StellarChainIcon';

export enum BridgeChains {
  PENDULUM = 'Pendulum',
  STELLAR = 'Stellar',
}

const chains = [
  { name: BridgeChains.PENDULUM, icon: <PendulumChainIcon height="24px" width="24px" /> },
  { name: BridgeChains.STELLAR, icon: <StellarChainIcon height="24px" width="24px" /> },
];

const BridgeComponentNew = () => {
  const { isConnected } = useInkathon();

  const [selectedChainFrom, setSelectedChainFrom] = useState<BridgeChains | null>(null);
  const [selectedChainTo, setSelectedChainTo] = useState<BridgeChains | null>(null);

  const [amount, setAmount] = useState<string>('');

  const { wrappedAssets, selectedAsset, setSelectedAsset, selectedVault } = useSpacewalkBridge();

  const issue = useIssueHandler({
    amount,
    selectedAsset,
    selectedVault,
  });

  const reedem = useReedemHandler({
    amount,
    selectedAsset,
    selectedVault,
  });

  const onClickSwitchArrow = () => {
    const tempSelectedChainFrom = selectedChainFrom;
    setSelectedChainFrom(selectedChainTo);
    setSelectedChainTo(tempSelectedChainFrom);
  };

  const confirmModal = useBoolean();

  const onClickConfirmButton = () => {
    if (selectedChainFrom === BridgeChains.PENDULUM) {
      reedem.handler();
    } else {
      issue.handler();
    }
  };

  const shouldDisableBridgeButton = () => {
    const noSelecteds = !selectedChainFrom || !selectedChainTo || !selectedAsset;

    const noValues = !Number(amount);

    return isConnected && (noSelecteds || noValues);
  };

  const assetInfo = useGetBridgeAssetInfo({ asset: selectedAsset, chain: selectedChainFrom });

  const getSecurityDeposit = () => {
    return Number(amount) * 0.005;
  };

  const onCloseConfirmModal = () => {
    confirmModal.setFalse();
    issue.resetStates();
    reedem.resetStates();
  };

  const isPending = issue.isLoading || reedem.isLoading;
  const isSuccess = issue.txSuccess || reedem.txSuccess;
  const isError = issue.txError || reedem.txError;

  const showPendingModal = isPending || isSuccess || isError;

  const theme = useTheme();

  const pendulumBalances = useSpacewalkBalances()
  // console.log('🚀 « pendulumBalances:', pendulumBalances);

  return (
    <>
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
                  {isPending && (
                    <SubHeaderSmall color="textSecondary" textAlign="center" marginBottom="12px">
                      Confirm this transaction in your wallet
                    </SubHeaderSmall>
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

      <SwapWrapper>
        <BridgeHeader />
        <SwapSection>
          <InputPanel>
            <Container hideInput={false} sx={{ height: 85 }}>
              <div>From {selectedChainFrom}</div>
              <InputRow>
                <BridgeSelector
                  modalTitle="Bridge from"
                  chains={chains}
                  disabledChains={[selectedChainTo]}
                  selectedChain={selectedChainFrom}
                  setSelectedChain={setSelectedChainFrom}
                  selectedAsset={selectedAsset}
                  setSelectedAsset={setSelectedAsset}
                  assets={wrappedAssets ?? []}
                  disabled={!isConnected}
                />
                <StyledNumericalInput
                  className="token-amount-input"
                  value={amount}
                  onUserInput={(value) => setAmount(value)}
                />
              </InputRow>
            </Container>
          </InputPanel>
        </SwapSection>

        <ArrowWrapper clickable={true} onClick={onClickSwitchArrow}>
          <ArrowContainer>
            <ArrowDown size="16" color={'#000000'} />
          </ArrowContainer>
        </ArrowWrapper>

        <OutputSwapSection>
          <InputPanel>
            <Container hideInput={false} sx={{ height: 85 }}>
              <div>To {selectedChainTo}</div>
              <InputRow>
                <BridgeSelector
                  modalTitle="Bridge to"
                  chains={chains}
                  selectedChain={selectedChainTo}
                  setSelectedChain={setSelectedChainTo}
                  selectedAsset={selectedAsset}
                  setSelectedAsset={setSelectedAsset}
                  assets={wrappedAssets ?? []}
                  disabled={!isConnected}
                  disabledChains={[selectedChainFrom]}
                />
                <StyledNumericalInput
                  className="token-amount-input"
                  value={amount}
                  onUserInput={(value) => setAmount(value)}
                />
              </InputRow>
            </Container>
          </InputPanel>
        </OutputSwapSection>
        <Box mt={2}>
          <BridgeButton
            isLoading={isPending}
            callback={confirmModal.setTrue}
            disabled={shouldDisableBridgeButton()}
          />
        </Box>
      </SwapWrapper>
    </>
  );
};

export default BridgeComponentNew;
