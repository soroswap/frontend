import '../../styles/globals.css';
import MockRouter from '../utils/router';
import Providers from 'components/Providers';
import AddLiquidityComponent from 'components/Liquidity/Add/AddLiquidityComponent';
import { mockedFreighterConnector, sleep, testnetXLM } from '../utils/utils';
import { useApiTokens } from 'hooks/tokens/useApiTokens';

interface MockedAddLiquidityProps {
  handleAddLiquidity?: ({
    setAttemptingTxn,
    setTxHash,
    setTxError,
  }: {
    setAttemptingTxn: (value: boolean) => void;
    setTxHash: (value: string | undefined) => void;
    setTxError: (value: boolean) => void;
  }) => void;
}

const MockedAddLiquidityComponent = ({ handleAddLiquidity }: MockedAddLiquidityProps) => {
  const { tokens, isLoading } = useApiTokens();

  const USDC = tokens.find((token) => token.code === 'USDC');

  if (isLoading) return <div>Loading...</div>;

  return (
    <AddLiquidityComponent
      currencyIdA={testnetXLM!}
      currencyIdB={USDC?.contract}
      handleAddLiquidity={handleAddLiquidity}
    />
  );
};

const MockedAddLiquidityPage = ({ handleAddLiquidity }: MockedAddLiquidityProps) => {
  return (
    <MockRouter>
      <Providers
        sorobanReactProviderProps={{
          connectors: [mockedFreighterConnector],
        }}
      >
        <MockedAddLiquidityComponent handleAddLiquidity={handleAddLiquidity} />
      </Providers>
    </MockRouter>
  );
};

describe('Swap Page', () => {
  it('Should able to add liquidity', async () => {
    cy.mount(
      <MockedAddLiquidityPage
        handleAddLiquidity={async ({ setAttemptingTxn, setTxHash }) => {
          setAttemptingTxn(true);

          await sleep(1000);

          setAttemptingTxn(false);

          setTxHash('0x123');
        }}
      />,
    );

    cy.connectFreighterWallet();

    cy.get('.token-amount-input').first().type('1');

    cy.contains('Supply').click();

    cy.get('[data-testid="confirm-swap-button"]').click();

    cy.contains('Waiting for confirmation');

    cy.contains('Transaction submitted');

    cy.wait(1000);

    cy.contains('Close').click();
  });
});
