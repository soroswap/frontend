import { AppContext } from 'contexts';
import { useSoroswapApi } from 'functions/generateRoute';
import { hasDistribution } from 'helpers/aggregator';
import { CurrencyAmount, TokenType } from 'interfaces';
import { useContext, useEffect, useMemo, useState } from 'react';
import {
  BuildSplitTradeReturn,
  BuildTradeReturn,
  ExactInBuildTradeReturn,
  ExactInSplitBuildTradeReturn,
  ExactOutBuildTradeReturn,
  ExactOutSplitBuildTradeReturn,
  InterfaceTrade,
  QuoteState, 
  TradeState,
  TradeType,
} from 'state/routing/types';
import useSWR from 'swr';

const TRADE_NOT_FOUND = {
  state: TradeState.NO_ROUTE_FOUND,
  trade: undefined,
} as const;
const TRADE_LOADING = { state: TradeState.LOADING, trade: undefined } as const;

/**
 * Returns the best v2+v3 trade for a desired swap.
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export function useBestTrade(
  tradeType: TradeType,
  amountSpecified?: CurrencyAmount,
  otherCurrency?: TokenType,
  account?: string,
): {
  state: TradeState;
  trade?: InterfaceTrade;
  resetRouterSdkCache: () => void;
} {
  const { generateRoute, resetRouterSdkCache, maxHops } = useSoroswapApi();
  const { protocolsStatus } = useContext(AppContext).Settings;
  
  /**
   * Custom hook that fetches the best trade based on the specified amount and trade type.
   *
   * @param {object} amountSpecified - The specified amount for the trade.
   * @param {object} otherCurrency - The other currency involved in the trade.
   * @param {number} maxHops - The maximum number of hops allowed for the trade.
   * @returns {object} - The data, isLoading, and isValidating values from the SWR hook.
   */
  // Fetch or save the route in cache
  const {
    data,
    isLoading: isLoadingSWR,
    isValidating,
  } = useSWR(

    amountSpecified && otherCurrency
      ? [amountSpecified, otherCurrency, tradeType, amountSpecified.value, maxHops, protocolsStatus]
      : null,
    ([amountAsset, quoteAsset, tradeType, amount, maxHops, protocolsStatus]) =>
      generateRoute({
        amountAsset,
        quoteAsset,
        amount,
        tradeType: tradeType,
        currentProtocolsStatus: protocolsStatus,
      }),
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      refreshInterval: 0,
    },
  );

  const isLoading = isLoadingSWR || isValidating;

  //Define the input and output currency based on the trade type
  const [currencyIn, currencyOut]: [TokenType | undefined, TokenType | undefined] = useMemo(
    () =>
      tradeType === TradeType.EXACT_INPUT
        ? [amountSpecified?.currency, otherCurrency]
        : [otherCurrency, amountSpecified?.currency],
    [amountSpecified, otherCurrency, tradeType],
  );

  const [expectedAmount, setExpectedAmount] = useState<string>('0');
  const [inputAmount, setInputAmount] = useState<CurrencyAmount | undefined>();
  const [outputAmount, setOutputAmount] = useState<CurrencyAmount | undefined>();

  useEffect(() => {
    if (!data || !currencyIn || !currencyOut) return;
    if (tradeType === TradeType.EXACT_INPUT) {
      const result = (data as ExactInBuildTradeReturn | ExactInSplitBuildTradeReturn).trade;

      setInputAmount({
        value: result?.amountIn.toString(),
        currency: currencyIn,
      });

      setOutputAmount({
        value: result?.amountOutMin.toString(),
        currency: currencyOut,
      });

      setExpectedAmount(result?.amountOutMin.toString());
    }

    if (tradeType === TradeType.EXACT_OUTPUT) {
      const result = (data as ExactOutBuildTradeReturn | ExactOutSplitBuildTradeReturn).trade;

      setInputAmount({
        value: result?.amountInMax.toString(),
        currency: currencyIn,
      });

      setOutputAmount({
        value: result?.amountOut.toString(),
        currency: currencyOut,
      });

      setExpectedAmount(result?.amountInMax.toString());
    }
  }, [data, currencyIn, currencyOut, tradeType]);

  // Create the trade object
  const trade: InterfaceTrade = useMemo(() => {
    const baseTrade = {
      inputAmount,
      outputAmount,
      expectedAmount,
      tradeType,
      rawRoute: data,
      path: (data as BuildTradeReturn)?.trade?.path ?? undefined,
      distribution: (data as BuildSplitTradeReturn)?.trade.distribution ?? undefined,
      priceImpact: data?.priceImpact,
      platform: data?.platform,
    };

    if (data?.trade && hasDistribution(data.trade)) {
      return {
        ...baseTrade,
        distribution: data.trade.distribution,
      };
    }

    return baseTrade;
  }, [expectedAmount, inputAmount, outputAmount, tradeType, data]);

  /*
  If the pairAddress or the trades chenges, we upgrade the tradeResult
  trade can change by changing the amounts, as well as the independent value
  */
  const tradeResult = useMemo(() => {
    // Trade is correctly updated depending on the user change (input token / amount, etc...)
    const state = data ? QuoteState.SUCCESS : QuoteState.NOT_FOUND;

    const myTradeResult = { state: state, trade: trade };
    return myTradeResult;
  }, [data, trade]); //should get the pair address and quotes

  const skipFetch: boolean = false;

  const bestTrade = useMemo(() => {
    if (skipFetch && amountSpecified && otherCurrency) {
      // If we don't want to fetch new trades, but have valid inputs, return the stale trade.
      return { state: TradeState.STALE, trade: trade, resetRouterSdkCache };
    } else if (!amountSpecified || (amountSpecified && !otherCurrency)) {
      return {
        state: TradeState.INVALID,
        trade: undefined,
        resetRouterSdkCache,
      };
    } else if (isLoading) {
      return {
        state: TradeState.LOADING,
        trade: undefined,
        resetRouterSdkCache,
      };
    } else if (tradeResult?.state === QuoteState.NOT_FOUND) {
      return {
        state: TradeState.NO_ROUTE_FOUND,
        trade: undefined,
        resetRouterSdkCache,
      };
    } else {
      return {
        state: TradeState.VALID, //isCurrent ? TradeState.VALID : TradeState.LOADING,
        trade: tradeResult.trade,
        resetRouterSdkCache,
      };
    }
  }, [
    skipFetch,
    amountSpecified,
    otherCurrency,
    tradeResult,
    trade,
    isLoading,
    resetRouterSdkCache,
  ]);

  return bestTrade;
}
