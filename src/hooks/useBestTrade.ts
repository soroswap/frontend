import { TokenType } from "interfaces";
import tryParseCurrencyAmount, {
  CurrencyAmount,
} from "lib/utils/tryParseCurrencyAmount";
import { useEffect, useMemo, useState } from "react";
import {
  InterfaceTrade,
  QuoteState,
  TradeState,
  TradeType,
} from "state/routing/types";
import { useSorobanReact } from "@soroban-react/core";
import { contractInvoke } from "@soroban-react/contracts";
import { useFactory } from "./useFactory";
import { addressToScVal, scValStrToJs } from "helpers/convert";
import { reservesBigNumber } from "./useReserves";
import fromExactInputGetExpectedOutput from "functions/fromExactInputGetExpectedOutput";
import BigNumber from "bignumber.js";

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

  const [currencyIn, currencyOut]: [TokenType | undefined, TokenType | undefined] = useMemo(
    () =>
      tradeType === TradeType.EXACT_INPUT
        ? [amountSpecified?.currency, otherCurrency]
        : [otherCurrency, amountSpecified?.currency],
    [amountSpecified, otherCurrency, tradeType]
  )

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

  const [reserves, setReserves] = useState();

  useEffect(() => {
      let isCancelled = false; // to keep track if the component is still mounted
  
      const fetchReserves = async () => {
          const reservesResponse = await reservesBigNumber(pairAddress ?? "", sorobanContext);
          if (!isCancelled && reservesResponse != undefined) {
              setReserves(reservesResponse);
          }
      };
      fetchReserves();
  
      // Cleanup
      return () => {
          isCancelled = true; // marks that the component has unmounted
      };
  }, [pairAddress, sorobanContext]);

  const expectedAmount = reserves ? fromExactInputGetExpectedOutput(BigNumber(amountSpecified?.value), reserves?.reserve0, reserves?.reserve1).toNumber() : 0 //TODO: Should get expected from input or output, currently only doing one way around
  console.log("🚀 « expectedAmount:", expectedAmount)

  const inputAmount = (currencyIn?.token_address == amountSpecified?.currency.token_address) ? tryParseCurrencyAmount(amountSpecified?.value, currencyIn) : tryParseCurrencyAmount(expectedAmount, currencyIn)
  console.log("🚀 « inputAmount:", inputAmount?.value)
  const outputAmount = (currencyOut?.token_address == otherCurrency?.token_address) ? tryParseCurrencyAmount(expectedAmount, currencyOut) : tryParseCurrencyAmount(amountSpecified?.value, currencyOut)
  console.log("🚀 « outputAmount:", outputAmount?.value)

  //TODO: Set the trade specs, getQuote
  const trade: InterfaceTrade = useMemo(() => {
    return {
      inputAmount: inputAmount,
      outputAmount: outputAmount,
      expectedAmount: isNaN(expectedAmount) ? 0 : expectedAmount,
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
  }, [currencyIn, currencyOut, expectedAmount, inputAmount, outputAmount, pairAddress, tradeType]);

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
