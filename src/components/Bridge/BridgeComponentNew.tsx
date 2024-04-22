import { Box, useTheme } from '@mui/material';
import { useInkathon } from '@scio-labs/use-inkathon';
import {
  Container,
  InputPanel,
  InputRow,
  StyledNumericalInput,
} from 'components/CurrencyInputPanel/SwapCurrencyInputPanel';
import { ArrowContainer, OutputSwapSection, SwapSection } from 'components/Swap/SwapComponent';
import { ArrowWrapper, SwapWrapper } from 'components/Swap/styleds';
import useIssueHandler from 'hooks/bridge/pendulum/useIssueHandler';
import useReedemHandler from 'hooks/bridge/pendulum/useReedemHandler';
import useSpacewalkBalances from 'hooks/bridge/pendulum/useSpacewalkBalances';
import useSpacewalkBridge from 'hooks/bridge/pendulum/useSpacewalkBridge';
import useBoolean from 'hooks/useBoolean';
import { useState } from 'react';
import { ArrowDown } from 'react-feather';
import { BridgeButton } from './BridgeButton';
import BridgeConfirmModal from './BridgeConfirmModal';
import BridgeHeader from './BridgeHeader';
import BridgeSelector from './BridgeSelector';
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

  const confirmModal = useBoolean();

  const [selectedChainFrom, setSelectedChainFrom] = useState<BridgeChains | null>(null);
  const [selectedChainTo, setSelectedChainTo] = useState<BridgeChains | null>(null);

  const [amount, setAmount] = useState<string>('0');

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

  const onCloseConfirmModal = () => {
    confirmModal.setFalse();
    issue.resetStates();
    reedem.resetStates();
  };

  const isPending = issue.isLoading || reedem.isLoading;
  const isSuccess = issue.txSuccess || reedem.txSuccess;
  const isError = issue.txError || reedem.txError;
  const txHash = issue.txHash || reedem.txHash;

  const showPendingModal = isPending || isSuccess || isError;

  const theme = useTheme();

  const { balances } = useSpacewalkBalances()
  console.log('🚀 « balances:', balances);
  // console.log('🚀 « pendulumBalances:', pendulumBalances);

  return (
    <>
      <BridgeConfirmModal
        amount={amount}
        confirmModal={confirmModal}
        isError={isError}
        isPending={isPending}
        isSuccess={isSuccess}
        onClickConfirmButton={onClickConfirmButton}
        onCloseConfirmModal={onCloseConfirmModal}
        selectedAsset={selectedAsset}
        selectedChainFrom={selectedChainFrom}
        selectedChainTo={selectedChainTo}
        showPendingModal={showPendingModal}
        txHash={txHash}
      />

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
