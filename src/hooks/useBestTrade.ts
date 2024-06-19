import { useRouterSDK } from 'functions/generateRoute';
import { CurrencyAmount, TokenType } from 'interfaces';
import { useEffect, useMemo, useState } from 'react';
import { TradeType as SdkTradeType } from 'soroswap-router-sdk';
import { InterfaceTrade, QuoteState, TradeState, TradeType, TransactionType } from 'state/routing/types';
import useSWR from 'swr';
import {Asset} from '@stellar/stellar-sdk'
import { SorobanContextType } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { ServerApi } from '@stellar/stellar-sdk/lib/horizon';

const TRADE_NOT_FOUND = {
  state: TradeState.NO_ROUTE_FOUND,
  trade: undefined,
} as const;
const TRADE_LOADING = { state: TradeState.LOADING, trade: undefined } as const;

const getClassicAsset = (currency: TokenType) => {
  if (!currency) return
  if (currency?.code === 'XLM') {
    const nativeAsset = Asset.native()
    return nativeAsset
  }
  if (!currency.issuer) {
    throw new Error(`Can't convert ${currency.code} to stellar classic asset`)
  }
  const asset = new Asset(currency.code, currency.issuer)
  return asset
}

const getAmount = (amount: string) => {
  return new BigNumber(amount).dividedBy(10000000).toString()
}

const parseHorizonResult = (payload: ServerApi.PaymentPathRecord, tradeType: TradeType) =>{
  
  const currecnyIn: TokenType = payload.source_asset_type == 'native' ? {
    code: 'XLM',
    contract: '',
  } : {
    code: payload.source_asset_code,
    issuer: payload.source_asset_issuer,
    contract: `${payload.source_asset_code}:${payload.source_asset_issuer}`
  }

  const currencyOut: TokenType = payload.destination_asset_type == 'native' ? {
    code: 'XLM',
    contract: '',
  } :  {
    code: payload.destination_asset_code,
    issuer: payload.destination_asset_issuer,
    contract: `${payload.destination_asset_code}:${payload.destination_asset_issuer}`
  }

  const inputAmount: CurrencyAmount = {
    currency: currecnyIn,
    value: new BigNumber(payload.source_amount).multipliedBy(10000000).toString()
  }

  const outputAmount: CurrencyAmount = {
    currency: currencyOut,
    value: new BigNumber(payload.destination_amount).multipliedBy(10000000).toString()
  }

  const path = [currecnyIn, ...payload.path, currencyOut]

  const parsedResult = {
    inputAmount: inputAmount,
    outputAmount: outputAmount,
    tradeType: tradeType,
    path: path,
    priceImpact: undefined,
    transctionType: TransactionType.STELLAR_CLASSIC,
  }
  
  return parsedResult
} 

function getHorizonBestPath(
  payload: any,
  sorobanContext: SorobanContextType
) {
  if (!payload.assetFrom || !payload.assetTo || !payload.amount || !sorobanContext) {
    return;
  }

  const { serverHorizon, activeChain } = sorobanContext;
  if (!serverHorizon || !activeChain) {
    console.log('no serverHorizon or activeChain');
  }

  const args = {
    assetFrom: getClassicAsset(payload.assetFrom),
    assetTo: getClassicAsset(payload.assetTo),
    amount: getAmount(payload.amount)
  };

  if (payload.tradeType === TradeType.EXACT_INPUT) {
    try {
      const send = serverHorizon?.strictSendPaths(
        args.assetFrom!,
        args?.amount,
        [args.assetTo!]
      ).call().then((res) => {
        return res.records;
      });
      return send?.then(res => {
        return res.reduce((maxObj, obj) => {
          console.log(maxObj)
          if (obj.destination_amount > maxObj.destination_amount) {
            return obj;
          } else {
            return maxObj;
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  }

  if (payload.tradeType === TradeType.EXACT_OUTPUT) {
    try {
      const receive = serverHorizon?.strictReceivePaths(
        [args.assetFrom!],
        args.assetTo!,
        args?.amount,
      ).call().then((res) => {
        return res.records;
      });

      return receive?.then(res => {
        return res.reduce((maxObj, obj) => {
          if (obj.destination_amount > maxObj.destination_amount) {
            return obj;
          } else {
            return maxObj;
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
}

/**
 * Returns the best v2+v3 trade for a desired swap.
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 */
export function useBestTrade(
  sorobanContext: SorobanContextType,
  tradeType: TradeType,
  amountSpecified?: CurrencyAmount,
  otherCurrency?: TokenType,
  account?: string,
): {
  state: TradeState;
  trade?: InterfaceTrade;
  resetRouterSdkCache: () => void;
} {
  const { generateRoute, resetRouterSdkCache, maxHops } = useRouterSDK();
  /**
   * Custom hook that fetches the best trade based on the specified amount and trade type.
   *
   * @param {object} amountSpecified - The specified amount for the trade.
   * @param {object} otherCurrency - The other currency involved in the trade.
   * @param {number} maxHops - The maximum number of hops allowed for the trade.
   * @returns {object} - The data, isLoading, and isValidating values from the SWR hook.
   */
  const horizonPayload = {
    assetFrom: amountSpecified?.currency,
    assetTo: otherCurrency,
    amount: amountSpecified?.value,
    tradeType: tradeType,
  }
  const [horizonPath, setHorizonPath] = useState<any>('')
  const [soroswapPath, setSoroswapPath] = useState<any>('')

  const calculatePaths = async () => {
    if(!amountSpecified || !otherCurrency) return;
    await getHorizonBestPath(horizonPayload, sorobanContext)?.then(res=>{
      const parsedResult = parseHorizonResult(res, tradeType)
      setHorizonPath(parsedResult);
    })
    await generateRoute({ 
      amountTokenAddress: amountSpecified?.currency?.contract!, 
      quoteTokenAddress: otherCurrency?.contract!, 
      amount: amountSpecified?.value!, 
      tradeType: tradeType === TradeType.EXACT_INPUT ? SdkTradeType.EXACT_INPUT : SdkTradeType.EXACT_OUTPUT })?.then(res=>{
      const updatedResult = {
        ...res,
        transactionType: TransactionType.SOROBAN
      };
      setSoroswapPath(updatedResult);
      })
  }

  const chooseBestPath = () => {
    if(!horizonPath || !soroswapPath) return;
    if(horizonPath.destination_amount > soroswapPath.trade.amountOutMin) {
      return horizonPath
    } else {
      return soroswapPath
    }
  }

  useEffect(() => {
    calculatePaths()
  }, [amountSpecified, otherCurrency, tradeType])

  useEffect(() => {
    if(!amountSpecified || !otherCurrency) return;
    const bestPath = chooseBestPath()
    console.log(bestPath)
    console.log('🔵', horizonPath)
  }, [horizonPath, soroswapPath])


  // Fetch or save the route in cache
  const {
    data,
    isLoading: isLoadingSWR,
    isValidating,
  } = useSWR(
    amountSpecified && otherCurrency
      ? [
          amountSpecified.currency.contract,
          otherCurrency.contract,
          tradeType,
          amountSpecified.value,
          maxHops,
        ]
      : null,
    ([amountTokenAddress, quoteTokenAddress, tradeType, amount, maxHops]) =>
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

  // Create the trade object
  const trade: InterfaceTrade = useMemo(() => {
    return {
      inputAmount,
      outputAmount,
      expectedAmount, // //isNaN(expectedAmount) ? 0 : expectedAmount,
      path: data?.trade.path,
      tradeType: tradeType,
      rawRoute: data,
      priceImpact: data?.priceImpact,
      transctionType: TransactionType.SOROBAN,
    };
  }, [expectedAmount, inputAmount, outputAmount, tradeType, data]);
  console.log(trade)
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
