import { useEffect, useState } from 'react';
import {
  Container,
  InputPanel,
  InputRow,
  StyledNumericalInput,
} from 'components/CurrencyInputPanel/SwapCurrencyInputPanel';
import { ArrowContainer, OutputSwapSection, SwapSection } from 'components/Swap/SwapComponent';
import { ArrowDown } from 'react-feather';
import { ArrowWrapper, SwapWrapper } from 'components/Swap/styleds';
import { Box } from '@mui/material';
import { BridgeButton } from './BridgeButton';
import { useInkathon } from '@scio-labs/use-inkathon';
import BridgeHeader from './BridgeHeader';
import BridgeSelector from './BridgeSelector';
import PendulumChainIcon from './ChainIcons/PendulumChainIcon';
import StellarChainIcon from './ChainIcons/StellarChainIcon';
import useIssueHandler from 'hooks/bridge/pendulum/useIssueHandler';
import useReedemHandler from 'hooks/bridge/pendulum/useReedemHandler';
import useSpacewalkBridge from 'hooks/bridge/pendulum/useSpacewalkBridge';

enum BridgeChains {
  PENDULUM = 'Pendulum',
  STELLAR = 'Stellar',
}

const chains = [
  { name: BridgeChains.PENDULUM, icon: <PendulumChainIcon height="24px" width="24px" /> },
  { name: BridgeChains.STELLAR, icon: <StellarChainIcon height="24px" width="24px" /> },
];

const BridgeComponentNew = () => {
  const { isConnected } = useInkathon();

  const [selectedChainFrom, setSelectedChainFrom] = useState<string>('');
  const [selectedChainTo, setSelectedChainTo] = useState<string>('');

  const [amount, setAmount] = useState<string>('');

  const { wrappedAssets, selectedAsset, setSelectedAsset, selectedVault } = useSpacewalkBridge();

  const { handler: issueHandler, isLoading: isLoadingIssue } = useIssueHandler({
    amount,
    selectedAsset,
    selectedVault,
  });

  const { handler: reedemHandler, isLoading: isLoadingReedem } = useReedemHandler({
    amount,
    selectedAsset,
    selectedVault,
  });

  const onClickSwitchArrow = () => {
    const tempSelectedChainFrom = selectedChainFrom;
    setSelectedChainFrom(selectedChainTo);
    setSelectedChainTo(tempSelectedChainFrom);
  };

  const onClickBridgeButton = () => {
    console.log(`
      Send ${amount} ${selectedAsset?.code} from ${selectedChainFrom} to ${selectedChainTo}
    `);

    if (selectedChainFrom === BridgeChains.PENDULUM) {
      issueHandler();
    } else {
      reedemHandler();
    }
  };

  const shouldDisableBridgeButton = () => {
    const noSelecteds = !selectedChainFrom || !selectedChainTo || !selectedAsset;

    const noValues = !Number(amount);

    return isConnected && (noSelecteds || noValues);
  };

  //Since we only have two chains, we can set the other chain when one is selected
  //Remove this when we have more chains
  useEffect(() => {
    if (selectedChainFrom === BridgeChains.PENDULUM && selectedChainTo !== BridgeChains.STELLAR) {
      setSelectedChainTo(BridgeChains.STELLAR);
    }

    if (selectedChainFrom === BridgeChains.STELLAR && selectedChainTo !== BridgeChains.PENDULUM) {
      setSelectedChainTo(BridgeChains.PENDULUM);
    }

    if (selectedChainTo === BridgeChains.PENDULUM && selectedChainFrom !== BridgeChains.STELLAR) {
      setSelectedChainFrom(BridgeChains.STELLAR);
    }

    if (selectedChainTo === BridgeChains.STELLAR && selectedChainFrom !== BridgeChains.PENDULUM) {
      setSelectedChainFrom(BridgeChains.PENDULUM);
    }
  }, [selectedChainFrom, selectedChainTo]);

  return (
    <SwapWrapper>
      <BridgeHeader />
      <SwapSection>
        <InputPanel>
          <Container hideInput={false} sx={{ height: 85 }}>
            <div>From {selectedChainFrom}</div>
            <InputRow>
              <BridgeSelector
                modalTitle="Swap from"
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
                modalTitle="Swap to"
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
          isLoading={isLoadingIssue || isLoadingReedem}
          callback={onClickBridgeButton}
          disabled={shouldDisableBridgeButton()}
        />
      </Box>
    </SwapWrapper>
  );
};

export default BridgeComponentNew;
