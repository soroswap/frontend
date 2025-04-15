import { calculateSwapFees } from 'functions/getNetworkFees';
import { ExactInBuildTradeReturn, InterfaceTrade, TradeType } from 'state/routing/types';
import { SorobanContextType, useSorobanReact } from 'stellar-react';
import { xlmTokenList } from 'constants/xlmToken';
import { useSoroswapApi } from 'functions/generateRoute';
import { TokenType } from 'interfaces';
import useSWRImmutable from 'swr/immutable';
import { useContext } from 'react';
import { AppContext } from 'contexts';
import { passphraseToBackendNetworkName } from 'services/pairs';

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
  const { protocolsStatus } = useContext(AppContext).Settings;

  const { generateRoute } = useSoroswapApi();

  const isFirstTokenXLMAndHasSecondTokenSelected = () => {
    const currencyA = currencies.INPUT;
    const currencyB = currencies.OUTPUT;

    if (!currencyA || !currencyB) return false;

    const { activeNetwork } = sorobanContext;
    if (!activeNetwork) return false;
    const chainId = passphraseToBackendNetworkName[activeNetwork].toLowerCase();

    const xlmTokenContract = xlmTokenList.find((tList) => tList.network === chainId)?.assets?.[0]
      ?.contract;

    const isXLMFirst = currencyA?.contract === xlmTokenContract;

    const hasSecondToken = !!currencyB?.contract;

    return isXLMFirst && hasSecondToken;
  };

  const buildTradeWithOneXlmAsInput = async (): Promise<InterfaceTrade | undefined> => {
    const valueOfOne = '10000000';

    const currencyA = { currency: currencies.INPUT! as TokenType, value: '0' };
    const currencyB = currencies.OUTPUT;

    if (!currencyA || !currencyB) return undefined;

    const result = await generateRoute({
      amountAsset: currencyA,
      quoteAsset: currencyB,
      amount: valueOfOne,
      tradeType: TradeType.EXACT_INPUT,
      currentProtocolsStatus: protocolsStatus,
    });
    if (!result) return undefined;

    const outputAmount = (result as ExactInBuildTradeReturn)?.trade.amountOutMin || '0';

    const trade: InterfaceTrade = {
      inputAmount: {
        value: valueOfOne,
        currency: currencyA.currency!,
      },
      outputAmount: {
        value: outputAmount.toString(),
        currency: currencyB,
      },
      path: (result as ExactInBuildTradeReturn)?.trade.path,
      tradeType: TradeType.EXACT_INPUT,
      platform: result.platform,
    };

    return trade;
  };

  const output = useSWRImmutable(
    isFirstTokenXLMAndHasSecondTokenSelected() ? ['output-of-one-xlm', currencies] : null,
    () => buildTradeWithOneXlmAsInput(),
  );

  const tradeToBeUsed = output.data || trade;

  const { data, error, isLoading, mutate } = useSWRImmutable(
    tradeToBeUsed ? ['swap-network-fees', sorobanContext, tradeToBeUsed] : null,
    ([key, sorobanContext]) => fetchNetworkFees(tradeToBeUsed, sorobanContext),
  );

  return { networkFees: data || 0, isLoading, isError: error, mutate };
};

export default useSwapNetworkFees;
