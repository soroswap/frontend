import { Box, useTheme } from '@mui/material';
import { useInkathon } from '@scio-labs/use-inkathon';
import { useSorobanReact } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import CurrencyBalance from 'components/CurrencyInputPanel/CurrencyBalance';
import {
  Container,
  InputPanel,
  InputRow,
  StyledNumericalInput,
} from 'components/CurrencyInputPanel/SwapCurrencyInputPanel';
import { TextWithLoadingPlaceholder } from 'components/Swap/AdvancedSwapDetails';
import { ArrowContainer, OutputSwapSection, SwapSection } from 'components/Swap/SwapComponent';
import { ArrowWrapper, SwapWrapper } from 'components/Swap/styleds';
import useIssueHandler from 'hooks/bridge/pendulum/useIssueHandler';
import useRedeemHandler from 'hooks/bridge/pendulum/useRedeemHandler';
import useSpacewalkBalances from 'hooks/bridge/pendulum/useSpacewalkBalances';
import useSpacewalkBridge from 'hooks/bridge/pendulum/useSpacewalkBridge';
import useBoolean from 'hooks/useBoolean';
import useGetMyBalances from 'hooks/useGetMyBalances';
import useGetNativeTokenBalance from 'hooks/useGetNativeTokenBalance';
import { useEffect, useState } from 'react';
import { ArrowDown } from 'react-feather';
import { BASE_FEE } from 'stellar-sdk';
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
  const { activeChain, address, serverHorizon } = useSorobanReact();
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

  const redeem = useRedeemHandler({
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
      redeem.handler();
    } else {
      issue.handler();
    }
  };

  const shouldDisableBridgeButton = () => {
    const noSelecteds = !selectedChainFrom || !selectedChainTo || !selectedAsset;

    const noValues = !Number(amount);
    const isInvalidBridgeAmount = Boolean(amount > (fromAssetBalance ?? 0))
    
    return isConnected && (noSelecteds || noValues || isInvalidBridgeAmount);
  };

  const onCloseConfirmModal = () => {
    confirmModal.setFalse();
    issue.resetStates();
    redeem.resetStates();
  };

  const isPending = issue.isLoading || redeem.isLoading;
  const isSuccess = issue.txSuccess || redeem.txSuccess;
  const isError = issue.txError || redeem.txError;
  const txHash = issue.txHash || redeem.txHash;

  const showPendingModal = isPending || isSuccess || isError;

  const theme = useTheme();

  const { balances: spacewalkBalances, isLoading, mutate } = useSpacewalkBalances();

  const spacewalkAssetBalance = spacewalkBalances?.find((balance) => {
    return balance.asset === selectedAsset?.code;
  });

  const { tokenBalancesResponse, isLoading: isLoadingMyBalances } = useGetMyBalances();

  const stellarBalance =
    tokenBalancesResponse?.balances?.find(
      (b) =>
        activeChain?.networkPassphrase &&
        b?.contract === selectedAsset?.contractId(activeChain.networkPassphrase),
    )?.balance || '0';

  const fromAssetBalance =
    selectedChainFrom === 'Stellar' ? stellarBalance : spacewalkAssetBalance?.balance;

  
  const [subentryCount, setSubentryCount] = useState<number>(0)
  const nativeBalance = useGetNativeTokenBalance();

  useEffect(() => {
    const getSubentryCount = async () => {
      if (address && nativeBalance.data?.validAccount) {
        const account = await serverHorizon?.loadAccount(address);
        const count = account?.subentry_count ?? 0;
        setSubentryCount(count);
      }
    };

    getSubentryCount();
  }, [address, nativeBalance.data?.validAccount, serverHorizon])

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
        extrinsic={issue.extrinsic ?? redeem.extrinsic}
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
              {selectedChainFrom === 'Stellar' ? (
                <CurrencyBalance
                  contract={selectedAsset?.contractId(activeChain?.networkPassphrase ?? '') ?? ''}
                  onMax={(value) => setAmount(value)}
                  hideBalance={false}
                  showMaxButton={true}
                  networkFees={Number(BigNumber(BASE_FEE).shiftedBy(-7))}
                  subentryCount={subentryCount}
                />
              ) : (
                //TODO: Add MAX button for other networks balances
                <TextWithLoadingPlaceholder syncing={isLoading} width={100}>
                  <>Balance: {fromAssetBalance}</>
                </TextWithLoadingPlaceholder>
              )}
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
