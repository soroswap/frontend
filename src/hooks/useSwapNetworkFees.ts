import { calculateSwapFees } from 'functions/getNetworkFees';
import { InterfaceTrade, PlatformType } from 'state/routing/types';
import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import useSWRImmutable from 'swr/immutable';
import { useRouterSDK } from 'functions/generateRoute';
import { TokenType } from 'interfaces';
import { xlmTokenList } from 'constants/xlmToken';
import { Networks } from '@stellar/stellar-sdk';
import { TradeType } from 'soroswap-router-sdk';

type Currencies = {
  INPUT?: TokenType | null | undefined;
  OUTPUT?: TokenType | null | undefined;
};

const fetchNetworkFees = async (
  trade: InterfaceTrade | undefined,
  sorobanContext: SorobanContextType,
) => {
  if (!trade || !sorobanContext) return 0;

  const fees = await calculateSwapFees(sorobanContext, trade);
  return fees ? Number(fees) / 10 ** 7 : 0;
};

const useSwapNetworkFees = (trade: InterfaceTrade | undefined, currencies: Currencies) => {
  const sorobanContext = useSorobanReact();

  const { generateRoute } = useRouterSDK();

  const isFirstTokenXLMAndHasSecondTokenSelected = () => {
    const currencyA = currencies.INPUT;
    const currencyB = currencies.OUTPUT;

    if (!currencyA || !currencyB) return false;

    const chainId = sorobanContext.activeChain?.id;

    const xlmTokenContract = xlmTokenList.find((tList) => tList.network === chainId)?.assets?.[0]
      ?.contract;

    const isXLMFirst = currencyA?.contract === xlmTokenContract;

    const hasSecondToken = !!currencyB?.contract;

    return isXLMFirst && hasSecondToken;
  };

  const buildTradeWithOneXlmAsInput = async (): Promise<InterfaceTrade | undefined> => {
    const valueOfOne = '10000000';

    const currencyA = {currency: currencies.INPUT! as TokenType, value: '0'};
    const currencyB = currencies.OUTPUT;

    if (!currencyA || !currencyB) return undefined;

    const result = await generateRoute({
      amountAsset: currencyA,
      quoteAsset: currencyB,
      amount: valueOfOne,
      tradeType: TradeType.EXACT_INPUT,
    });

    if (!result) return undefined;

    const outputAmount = result?.trade.amountOutMin || '0';

    const trade: InterfaceTrade = {
      inputAmount: {
        value: valueOfOne,
        currency: currencyA.currency!,
      },
      outputAmount: {
        value: outputAmount,
        currency: currencyB,
      },
      path: result?.trade.path,
      tradeType: TradeType.EXACT_INPUT,
      platform: PlatformType.ROUTER
    };

    return trade;
  };

  const output = useSWRImmutable(
    isFirstTokenXLMAndHasSecondTokenSelected() ? ['output-of-one-xlm', currencies] : null,
    () => buildTradeWithOneXlmAsInput(),
  );

  const tradeToBeUsed = output.data || trade;

  const { data, error, isLoading, mutate } = useSWRImmutable(
    tradeToBeUsed ? ['swap-network-fees', sorobanContext] : null,
    ([key, sorobanContext]) => fetchNetworkFees(tradeToBeUsed, sorobanContext),
  );

  return { networkFees: data || 0, isLoading, isError: error, mutate };
};

export default useSwapNetworkFees;
