import '../../styles/globals.css';

import { Field } from 'state/swap/actions';
import { freighter } from '@soroban-react/freighter';
import { SetStateAction } from 'react';
import { SwapComponent, SwapStateProps } from 'components/Swap/SwapComponent';
import { xlmTokenList } from 'constants/xlmToken';
import MockRouter from '../utils/router';
import Providers from 'components/Providers';

interface MockedSwapPageProps {
  handleDoSwap?:
    | ((setSwapState: (value: SetStateAction<SwapStateProps>) => void) => void)
    | undefined;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MockedSwapPage = ({ handleDoSwap }: MockedSwapPageProps) => {
  const mockedFreighterConnector = {
    ...freighter(),
    isConnected: () => true,
    getPublicKey: () => Promise.resolve('GCHR5WWPDFF3U3HP2NA6TI6FCQPYEWS3UOPIPJKZLAAFM57CEG4ZYBWP'),
  };

  const testnetXLM =
    xlmTokenList.find((tList) => tList.network === 'testnet')?.assets?.[0]?.contract ?? null;

  const prefilledState = {
    [Field.INPUT]: { currencyId: testnetXLM },
    [Field.OUTPUT]: { currencyId: null },
  };

  return (
    <MockRouter>
      <Providers
        sorobanReactProviderProps={{
          connectors: [mockedFreighterConnector],
        }}
      >
        <SwapComponent prefilledState={prefilledState} handleDoSwap={handleDoSwap} />
      </Providers>
    </MockRouter>
  );
};

describe('Swap Page', () => {
  it('Should connect freighter wallet', () => {
    cy.mount(<MockedSwapPage />);
    cy.connectFreighterWallet();
  });
  it('Should able to swap tokens', () => {
    cy.mount(
      <MockedSwapPage
        handleDoSwap={async (setSwapState) => {
          await sleep(1000);

          setSwapState((currentState) => ({
            ...currentState,
            swapError: undefined,
            swapResult: {
              status: 'SUCCESS',
              txHash: '0x123',
            },
          }));
        }}
      />,
    );

    cy.connectFreighterWallet();

    cy.selectUSDCAndTriggerSwap();

    cy.contains('Success');

    cy.wait(1000);

    cy.get('[data-testid="confirmation-close-icon"]').click();
  });
});
