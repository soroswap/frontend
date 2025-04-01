import { Box, Button } from 'soroswap-ui';
import { useInkathon } from '@scio-labs/use-inkathon';
import { useSorobanReact } from 'stellar-react';
import BigNumber from 'bignumber.js';
import CurrencyBalance from 'components/CurrencyInputPanel/CurrencyBalance';
import {
  Container,
  InputPanel,
  InputRow,
  StyledNumericalInput,
} from 'components/CurrencyInputPanel/SwapCurrencyInputPanel';
import { ArrowContainer, OutputSwapSection, SwapSection } from 'components/Swap/SwapComponent';
import { ArrowWrapper, SwapWrapper } from 'components/Swap/styleds';
import { nativeStellarToDecimal } from 'helpers/bridge/pendulum/spacewalk';
import useIssueHandler from 'hooks/bridge/pendulum/useIssueHandler';
import useRedeemHandler from 'hooks/bridge/pendulum/useRedeemHandler';
import useSpacewalkBalances from 'hooks/bridge/pendulum/useSpacewalkBalances';
import useSpacewalkBridge from 'hooks/bridge/pendulum/useSpacewalkBridge';
import { useSpacewalkFees } from 'hooks/bridge/pendulum/useSpacewalkFees';
import useBoolean from 'hooks/useBoolean';
import useGetMyBalances from 'hooks/useGetMyBalances';
import { useEffect, useMemo, useState } from 'react';
import { ArrowDown } from 'react-feather';
import { BridgeButton } from './BridgeButton';
import BridgeConfirmModal from './BridgeConfirmModal';
import BridgeDisclaimerDropdown from './BridgeDisclaimer';
import BridgeHeader from './BridgeHeader';
import BridgeSelector from './BridgeSelector';
import PendulumChainIcon from './ChainIcons/PendulumChainIcon';
import StellarChainIcon from './ChainIcons/StellarChainIcon';
import PolkadotCurrencyBalance from './PolkadotCurrencyBalance';

import { useModalStepper } from 'hooks/bridge/pendulum/useModalStepper';
import { StepKeys, IssueStepsByKeys } from 'components/Bridge/BridgeSteps';

export enum BridgeChains {
  PENDULUM = 'Pendulum',
  STELLAR = 'Stellar',
}

const chains = [
  { name: BridgeChains.PENDULUM, icon: <PendulumChainIcon height="24px" width="24px" /> },
  { name: BridgeChains.STELLAR, icon: <StellarChainIcon height="24px" width="24px" /> },
];

const BridgeComponent = () => {
  const { activeChain } = useSorobanReact();

  const { isConnected } = useInkathon();

  const { getFees } = useSpacewalkFees();

  const fees = getFees();

  const confirmModal = useBoolean();

  const { balances: spacewalkBalances, isLoading, mutate } = useSpacewalkBalances();

  const refreshSpaceWalkBalances = () => {
    mutate();
  };
  const {
    tokenBalancesResponse,
    availableNativeBalance,
    isLoading: isLoadingMyBalances,
    refetch,
  } = useGetMyBalances();

  const stepper = useModalStepper();

  const [selectedChainFrom, setSelectedChainFrom] = useState<BridgeChains | null>(null);
  const [selectedChainTo, setSelectedChainTo] = useState<BridgeChains | null>(null);

  const [amount, setAmount] = useState<string>('');

  const { wrappedAssets, selectedAsset, setSelectedAsset, selectedVault, selectedVaultExtended } =
    useSpacewalkBridge();

  const issue = useIssueHandler({
    amount,
    selectedAsset,
    selectedVault,
    stepper,
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
    refetch();
    refreshSpaceWalkBalances();
  };

  const onClickConfirmButton = () => {
    if (selectedChainFrom === BridgeChains.PENDULUM) {
      redeem.handler();
    } else {
      issue.handler();
    }
    stepper.setActiveStep(IssueStepsByKeys[StepKeys.SIGN_RQ]);
  };

  const hasInsufficientLiquidity = () => {
    if (selectedChainFrom === BridgeChains.PENDULUM) {
      const reedemableTokens = selectedVaultExtended?.redeemableTokens ?? 0;

      if (Number(amount) > Number(reedemableTokens)) {
        return true;
      }
    }

    return false;
  };

  const hasInsufficientBalance = () => {
    const isInvalidBridgeAmount = Boolean(Number(amount) > (Number(fromAssetBalance) ?? 0));

    return isInvalidBridgeAmount;
  };

  const shouldDisableBridgeButton = () => {
    const noSelecteds = !selectedChainFrom || !selectedChainTo || !selectedAsset;

    const noValues = !Number(amount);

    const isInvalidBridgeAmount = hasInsufficientBalance();

    const insufficientLiquidity = hasInsufficientLiquidity();

    const shouldDisable =
      isConnected && (noSelecteds || noValues || isInvalidBridgeAmount || insufficientLiquidity);

    return shouldDisable;
  };

  const getBridgeButtonText = () => {
    const isInvalidBridgeAmount = hasInsufficientBalance();

    const insufficientLiquidity = hasInsufficientLiquidity();

    if (isInvalidBridgeAmount) {
      return 'Insufficient balance';
    }

    if (insufficientLiquidity) {
      return 'Insufficient liquidity';
    }
  };

  const onCloseConfirmModal = () => {
    confirmModal.setFalse();
    issue.resetStates();
    redeem.resetStates();
    stepper.handleReset();
  };

  const getModalStatus = () => {
    const isPending = issue.isLoading || redeem.isLoading;
    const isSuccess = issue.txSuccess || redeem.txSuccess;
    const isError = issue.txError || redeem.txError;
    const txHash = issue.txHash || redeem.txHash;
    const showPendingModal = isPending || isSuccess || isError;

    return { isPending, isSuccess, isError, txHash, showPendingModal };
  };

  const getStellarBalance = () => {
    let stellarBalance =
      tokenBalancesResponse?.balances?.find(
        (b) =>
          activeChain?.networkPassphrase &&
          b?.contract === selectedAsset?.contractId(activeChain.networkPassphrase),
      )?.balance || '0';

    if (selectedAsset?.code === 'XLM') {
      stellarBalance = availableNativeBalance();
      stellarBalance = stellarBalance.toNumber();
    }

    return stellarBalance;
  };

  const getSpacewalkBalance = () => {
    const spacewalkAssetBalance = spacewalkBalances?.find((balance) => {
      return balance.asset === selectedAsset?.code;
    });

    return spacewalkAssetBalance?.balance;
  };

  const getFromAssetBalance = () => {
    const fromAssetBalance =
      selectedChainFrom === BridgeChains.STELLAR ? getStellarBalance() : getSpacewalkBalance();

    return fromAssetBalance;
  };

  const modalStatus = getModalStatus();

  const fromAssetBalance = getFromAssetBalance();

  const endAmount = useMemo(() => {
    return (
      Number(amount) -
        Number(
          nativeStellarToDecimal(
            new BigNumber(amount).multipliedBy(
              selectedChainFrom === 'Stellar' ? fees.issueFee : fees.redeemFee,
            ),
          ),
        ) || 0
    );
  }, [amount, fees.issueFee, fees.redeemFee, selectedChainFrom]);

  const maxLengthAmount = (value: string, maxLength?: number) => {
    if (maxLength === 0 || !maxLength || value.length <= maxLength) {
      setAmount(value);
    } else {
      return false;
    }
  };
  //Auto select the other chain when the user selects one
  useEffect(() => {
    if (selectedChainFrom === BridgeChains.PENDULUM && selectedChainTo !== BridgeChains.STELLAR) {
      setSelectedChainTo(BridgeChains.STELLAR);
    }

    if (selectedChainFrom === BridgeChains.STELLAR && selectedChainTo !== BridgeChains.PENDULUM) {
      setSelectedChainTo(BridgeChains.PENDULUM);
    }
  }, [selectedChainFrom]);

  useEffect(() => {
    if (selectedChainTo === BridgeChains.PENDULUM && selectedChainFrom !== BridgeChains.STELLAR) {
      setSelectedChainFrom(BridgeChains.STELLAR);
    }

    if (selectedChainTo === BridgeChains.STELLAR && selectedChainFrom !== BridgeChains.PENDULUM) {
      setSelectedChainFrom(BridgeChains.PENDULUM);
    }
  }, [selectedChainTo]);

  useEffect(() => {
    refetch();
    refreshSpaceWalkBalances();
  }, [modalStatus.isSuccess, modalStatus.isError, modalStatus.isPending]);

  return (
    <>
      <BridgeConfirmModal
        amount={amount}
        confirmModal={confirmModal}
        isError={modalStatus.isError}
        isPending={modalStatus.isPending}
        isSuccess={modalStatus.isSuccess}
        onClickConfirmButton={onClickConfirmButton}
        onCloseConfirmModal={onCloseConfirmModal}
        selectedAsset={selectedAsset}
        selectedChainFrom={selectedChainFrom}
        selectedChainTo={selectedChainTo}
        showPendingModal={modalStatus.showPendingModal}
        txHash={modalStatus.txHash}
        errorMessage={issue.errorMessage || redeem.errorMessage}
        extrinsic={issue.extrinsic ?? redeem.extrinsic}
        tryAgain={issue.tryAgain}
        stepper={stepper}
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
                  onUserInput={(value) => maxLengthAmount(value, 27)}
                />
              </InputRow>
              {selectedChainFrom === 'Stellar' ? (
                <CurrencyBalance
                  contract={selectedAsset?.contractId(activeChain?.networkPassphrase ?? '') ?? ''}
                  onMax={(value) => setAmount(value)}
                  hideBalance={false}
                  showMaxButton={true}
                />
              ) : (
                <PolkadotCurrencyBalance
                  balances={spacewalkBalances ?? undefined}
                  selectedAsset={selectedAsset ?? undefined}
                  onMax={(value) => setAmount(value)}
                  isLoading={isLoading}
                  hideBalance={!selectedAsset}
                  showMaxButton={Boolean(selectedAsset)}
                />
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
                  value={endAmount}
                  onUserInput={(value) => maxLengthAmount(value, 27)}
                />
              </InputRow>
            </Container>
          </InputPanel>
        </OutputSwapSection>
        <Box mt={2} display={'flex'} sx={{ flexDirection: 'column', gap: 2 }}>
          <BridgeButton
            text={getBridgeButtonText()}
            isLoading={modalStatus.isPending}
            callback={confirmModal.setTrue}
            disabled={shouldDisableBridgeButton()}
          />
          <BridgeDisclaimerDropdown />
        </Box>
      </SwapWrapper>
    </>
  );
};

export default BridgeComponent;
