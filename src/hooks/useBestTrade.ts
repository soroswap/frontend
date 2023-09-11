import { TokenType, CurrencyAmount } from "interfaces";
import { useMemo, useState } from "react";
import {
  InterfaceTrade,
  QuoteState,
  TradeState,
  TradeType,
} from "state/routing/types";
import { useSorobanReact } from "@soroban-react/core";
import BigNumber from "bignumber.js";
import { getPairAddress } from "functions/getPairAddress";
import { getExpectedAmount } from "functions/getExpectedAmount";

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
} {
  const sorobanContext = useSorobanReact();
  const [pairAddress, setPairAddress] = useState<string | undefined>(undefined);

  const [currencyIn, currencyOut]: [
    TokenType | undefined,
    TokenType | undefined,
  ] = useMemo(
    () =>
      tradeType === TradeType.EXACT_INPUT
        ? [amountSpecified?.currency, otherCurrency]
        : [otherCurrency, amountSpecified?.currency],
    [amountSpecified, otherCurrency, tradeType],
  );

  /* This is because the user can set some input amount and input token, before setting the output token */
  if (amountSpecified?.currency?.address && otherCurrency?.address) {
    getPairAddress(
      amountSpecified?.currency?.address,
      otherCurrency?.address,
      sorobanContext,
    ).then((response) => {
      if (response) {
        setPairAddress(response);
      } else {
        setPairAddress(undefined);
      }
    });
  }

  // EXPECTED AMOUNTS. TODO: THIS WILL CHANGE AFTER USING THE ROUTER CONTRACT
  const [expectedAmount, setExpectedAmount] = useState<string>("0");
  if (amountSpecified?.value) {
    getExpectedAmount(
      currencyIn,
      currencyOut,
      BigNumber(amountSpecified.value),
      sorobanContext,
    ).then((resp) => {
      setExpectedAmount(resp?.toString());
    });
  }
  // Now both expectedAmount and amountSpecified are strings in stroop format
  // Lets convert all of this to two CurrencyAmount objects: inputAmount & outputAmount

  let inputAmount: CurrencyAmount | undefined;
  let outputAmount: CurrencyAmount | undefined;

  // TODO: Not sure if we need to check for all of this:
  if (amountSpecified && currencyIn && expectedAmount && currencyOut) {
    // Set inputAmount
    if (currencyIn?.address == amountSpecified?.currency.address) {
      inputAmount = {
        value: amountSpecified.value,
        currency: currencyIn,
      };
    } else {
      inputAmount = {
        value: expectedAmount,
        currency: currencyIn,
      };
    }

    // Set outputAmount
    if (currencyOut?.address == otherCurrency?.address) {
      outputAmount = {
        value: expectedAmount,
        currency: currencyOut,
      };
    } else {
      outputAmount = {
        value: amountSpecified?.value,
        currency: currencyOut,
      };
    }
  }

  // const inputAmount = (currencyIn?.address == amountSpecified?.currency.address) ? tryParseCurrencyAmount(amountSpecified?.value, currencyIn) : tryParseCurrencyAmount(expectedAmount, currencyIn)
  // console.log("🚀 ~ file: useBestTrade.ts: 🚀 « inputAmount:", inputAmount?.value)
  // const outputAmount = (currencyOut?.address == otherCurrency?.address) ? tryParseCurrencyAmount(expectedAmount, currencyOut) : tryParseCurrencyAmount(amountSpecified?.value, currencyOut)
  // console.log("🚀 ~ file: useBestTrade.ts: 🚀 « outputAmount:", outputAmount?.value)

  //TODO: Set the trade specs, getQuote

  //   /*
  //   export type InterfaceTrade = {
  //   inputAmount: CurrencyAmount;
  //   outputAmount: CurrencyAmount;
  //   tradeType: TradeType;
  //   swaps: {
  //     inputAmount: CurrencyAmount;
  //     outputAmount: CurrencyAmount;
  //     route: {
  //       input: TokenType;
  //       output: TokenType;
  //       pairs: {
  //         pairAddress: string;
  //       }[];
  //     };
  //   }[];
  // };

  //   */
  const trade: InterfaceTrade = useMemo(() => {
    return {
      inputAmount: inputAmount,
      outputAmount: outputAmount,
      expectedAmount, // //isNaN(expectedAmount) ? 0 : expectedAmount,
      tradeType: tradeType,
      swaps: [
        {
          inputAmount: inputAmount,
          outputAmount: outputAmount,
          route: {
            input: currencyIn,
            output: currencyOut,
            pairs: [
              {
                pairAddress,
              },
            ],
          },
        },
      ],
    };
  }, [
    currencyIn,
    currencyOut,
    expectedAmount,
    inputAmount,
    outputAmount,
    pairAddress,
    tradeType,
  ]);

  /*
  If the pairAddress or the trades chenges, we upgrade the tradeResult
  trade can change by changing the amounts, as well as the independent value
  */
  const tradeResult = useMemo(() => {
    // Trade is correctly updated depending on the user change (input token / amount, etc...)
    const state = pairAddress ? QuoteState.SUCCESS : QuoteState.NOT_FOUND;

    const myTradeResult = { state: state, trade: trade };
    return myTradeResult;
  }, [pairAddress, trade]); //should get the pair address and quotes

  const skipFetch: boolean = false;

  const bestTrade = useMemo(() => {
    if (skipFetch && amountSpecified && otherCurrency) {
      // If we don't want to fetch new trades, but have valid inputs, return the stale trade.
      return { state: TradeState.STALE, trade: trade };
    } else if (!amountSpecified || (amountSpecified && !otherCurrency)) {
      return {
        state: TradeState.INVALID,
        trade: undefined,
      };
    } else if (tradeResult?.state === QuoteState.NOT_FOUND) {
      return {
        state: TradeState.NO_ROUTE_FOUND,
        trade: undefined,
      };
    } else if (!tradeResult?.trade) {
      // TODO(WEB-1985): use `isLoading` returned by rtk-query hook instead of checking for `trade` status
      return {
        state: TradeState.LOADING,
        trade: undefined,
      };
    } else {
      return {
        state: TradeState.VALID, //isCurrent ? TradeState.VALID : TradeState.LOADING,
        trade: tradeResult.trade,
      };
    }
  }, [skipFetch, amountSpecified, otherCurrency, tradeResult, trade]);

  return bestTrade;
}
