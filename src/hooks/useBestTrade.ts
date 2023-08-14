import { TokenType } from "interfaces";
import tryParseCurrencyAmount, {
  CurrencyAmount,
} from "lib/utils/tryParseCurrencyAmount";
import { useCallback, useMemo, useState } from "react";
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
import { useContractValue } from "@soroban-react/contracts";
import { accountToScVal } from "helpers/soroban";
import { contractInvoke } from "@soroban-react/contracts";
import { useFactory } from "./useFactory";
import { addressToScVal, scValStrToJs } from "helpers/convert";

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
): Promise<{
  state: TradeState;
  trade?: InterfaceTrade;
}> {
  const sorobanContext = useSorobanReact();
  const [pairAddress, setPairAddress] = useState<string | undefined>(undefined);

  const factory = useFactory(sorobanContext);

  if (
    amountSpecified?.currency?.token_address &&
    otherCurrency?.token_address
  ) {
    contractInvoke({
      contractAddress: factory.factory_address,
      method: "get_pair",
      args: [
        addressToScVal(amountSpecified?.currency?.token_address),
        addressToScVal(otherCurrency?.token_address),
      ],
      sorobanContext,
    }).then((response) => {
      if (response) {
        setPairAddress(scValStrToJs(response.xdr) as string);
      } else {
        setPairAddress(undefined);
      }
    });
  }

  //TODO: Set the trade specs, getQuote
  const trade: InterfaceTrade = useMemo(() => {
    return {
      inputAmount: amountSpecified,
      outputAmount: tryParseCurrencyAmount("0", otherCurrency),
      tradeType: tradeType,
      swaps: [
        {
          inputAmount: amountSpecified,
          outputAmount: tryParseCurrencyAmount("0", otherCurrency), //this should get expected amount out
          route: {
            input: amountSpecified?.currency,
            output: otherCurrency,
            pairs: [
              {
                pairAddress,
              },
            ],
          },
        },
      ],
    };
  }, [amountSpecified, otherCurrency, pairAddress, tradeType]);

  const tradeResult = useMemo(() => {
    const state = pairAddress ? QuoteState.SUCCESS : QuoteState.NOT_FOUND;
    return { state: state, trade: trade };
  }, [pairAddress, trade]); //should get the pair address and quotes

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
