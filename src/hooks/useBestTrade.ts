import { TokenType } from "interfaces";
import tryParseCurrencyAmount from "lib/utils/tryParseCurrencyAmount";
import { useCallback, useMemo } from "react";
import {
  InterfaceTrade,
  QuoteMethod,
  QuoteState,
  TradeState,
  TradeType,
} from "state/routing/types";
import { useAllPairsFromTokens, usePairExist } from "./usePairExist";
import { SorobanContext, useSorobanReact } from "@soroban-react/core";
import { usePairContractAddress } from "./usePairContractAddress";

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
  amountSpecified?: { currency: TokenType | null | undefined; value: string },
  otherCurrency?: TokenType,
  account?: string,
): {
  state: TradeState;
  trade?: InterfaceTrade;
} {
  const sorobanContext = useSorobanReact();
  //TODO: Set the trade specs, getQuote
  const trade = {
    swaps: {
      inputAmount: amountSpecified,
      outputAmount: tryParseCurrencyAmount("0", otherCurrency), //this should get expected amount out
    },
  };

  const test = usePairContractAddress(
    amountSpecified?.currency?.token_address ?? null,
    otherCurrency?.token_address ?? null,
    sorobanContext,
  );
  console.log("🚀 « test:", test);

  const tradeResult = { state: QuoteState.NOT_FOUND, trade: trade }; //should get the pair address and quotes

  const skipFetch: boolean = false;

  return useMemo(() => {
    if (skipFetch && amountSpecified && otherCurrency) {
      // If we don't want to fetch new trades, but have valid inputs, return the stale trade.
      return { state: TradeState.STALE, trade: trade };
    } else if (!amountSpecified || (amountSpecified && !otherCurrency)) {
      return {
        state: TradeState.INVALID,
        trade: undefined,
      };
    } else if (tradeResult?.state === QuoteState.NOT_FOUND) {
      return TRADE_NOT_FOUND;
    } else if (!tradeResult?.trade) {
      // TODO(WEB-1985): use `isLoading` returned by rtk-query hook instead of checking for `trade` status
      return TRADE_LOADING;
    } else {
      return {
        state: TradeState.VALID, //isCurrent ? TradeState.VALID : TradeState.LOADING,
        trade: tradeResult.trade,
      };
    }
  }, [skipFetch, amountSpecified, otherCurrency, tradeResult, trade]);
}
