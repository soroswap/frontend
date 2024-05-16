import { freighter } from '@soroban-react/freighter';
import { SwapComponent } from 'components/Swap/SwapComponent';
import MockRouter from '../utils/router';
import Providers from 'components/Providers';

describe('Swap Page', () => {
  it('Should connect freighter wallet', () => {
    const mockedFreighterConnector = {
      ...freighter(),
      isConnected: () => true,
      getPublicKey: () =>
        Promise.resolve('GCHR5WWPDFF3U3HP2NA6TI6FCQPYEWS3UOPIPJKZLAAFM57CEG4ZYBWP'),
      signTransaction: () => Promise.resolve('signedTransaction'),
    };

    cy.mount(
      <MockRouter>
        <Providers
          sorobanReactProviderProps={{
            connectors: [mockedFreighterConnector],
          }}
        >
          <SwapComponent />
        </Providers>
      </MockRouter>,
    );

    cy.get('[data-testid="primary-button"]').click();

    cy.contains('Detected');

    cy.contains('Freighter Wallet').click();

    cy.get('[data-testid="primary-button"]').contains('Select a token');
  });
});
