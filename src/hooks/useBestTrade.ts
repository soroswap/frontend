import { CurrencyAmount, TokenType } from 'interfaces';
import { useRouterSDK } from 'functions/generateRoute';
import { InterfaceTrade, QuoteState, TradeState, TradeType } from 'state/routing/types';
import { ReservesType } from 'functions/getExpectedAmount';
import { TradeType as SdkTradeType } from 'soroswap-router-sdk';
import { useEffect, useMemo, useState } from 'react';
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
  const { generateRoute, resetRouterSdkCache } = useRouterSDK();

  const {
    data,
    isLoading: isLoadingSWR,
    isValidating,
  } = useSWR(
    amountSpecified && otherCurrency
      ? [amountSpecified.currency.address, otherCurrency.address, tradeType, amountSpecified.value]
      : null,
    ([amountTokenAddress, quoteTokenAddress, tradeType, amount]) =>
      generateRoute({
        amountTokenAddress,
        quoteTokenAddress,
        amount,
        tradeType:
          tradeType === TradeType.EXACT_INPUT
            ? SdkTradeType.EXACT_INPUT
            : SdkTradeType.EXACT_OUTPUT,
      }),
    {
      revalidateIfStale: true,
      revalidateOnFocus: true,
      refreshInterval: 0,
    },
  );

  const isLoading = isLoadingSWR || isValidating;

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
      const result = data.trade as {
        amountIn: string;
        amountOutMin: string;
        path: string[];
      };

      setInputAmount({
        value: result?.amountIn,
        currency: currencyIn,
      });

      setOutputAmount({
        value: result?.amountOutMin,
        currency: currencyOut,
      });

      setExpectedAmount(result?.amountOutMin);
    }

    if (tradeType === TradeType.EXACT_OUTPUT) {
      const result = data.trade as {
        amountInMax: string;
        amountOut: string;
        path: string[];
      };

      setInputAmount({
        value: result?.amountInMax,
        currency: currencyIn,
      });

      setOutputAmount({
        value: result?.amountOut,
        currency: currencyOut,
      });

      setExpectedAmount(result?.amountInMax);
    }
  }, [data, currencyIn, currencyOut, tradeType]);

  const trade: InterfaceTrade = useMemo(() => {
    return {
      inputAmount,
      outputAmount,
      expectedAmount, // //isNaN(expectedAmount) ? 0 : expectedAmount,
      path: data?.trade.path,
      tradeType: tradeType,
      rawRoute: data,
    };
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
