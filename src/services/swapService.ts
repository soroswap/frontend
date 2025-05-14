import { SorobanContextType } from 'stellar-react';
import { SwapState } from 'state/swap/reducer';
import { Field } from 'state/swap/actions';
import { TokenType, TokenMapType, CurrencyAmount } from 'interfaces'; // Import CurrencyAmount
import { relevantTokensType, tokenBalancesType } from 'hooks'; // Import tokenBalancesType
import { InterfaceTrade, TradeState, TradeType } from 'state/routing/types'; // Import TradeType
import { ReactNode } from 'react';
import { findTokenService } from './tokenService'; // Import findTokenService
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'; // Import tryParseCurrencyAmount
import { tokenBalances } from 'hooks'; // Import tokenBalances
import { useBestTrade } from 'hooks/useBestTrade'; // Import useBestTrade
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks'; // Import useUserSlippageToleranceWithDefault
import { DEFAULT_SLIPPAGE_INPUT_VALUE } from 'components/Settings/MaxSlippageSettings'; // Import DEFAULT_SLIPPAGE_INPUT_VALUE
import { isAddress } from 'helpers/address'; // Import isAddress
import { AccountResponse } from '@stellar/stellar-sdk/lib/horizon'; // Import AccountResponse
import BigNumber from 'bignumber.js';


export type SwapInfoService = {
  currencies: { [field in Field]?: TokenType | null };
  currencyBalances: { [field in Field]?: relevantTokensType | string | undefined }; //{ [field in Field]?: CurrencyAmount<Currency> }
  parsedAmount?: any; //CurrencyAmount<Currency>
  inputError?: ReactNode;
  trade: {
    trade?: any; //InterfaceTrade
    state: any; //TradeState
    uniswapXGasUseEstimateUSD?: number;
    error?: any;
  };
  allowedSlippage: any; //Percent
  autoSlippage: any; //Percent
};

// Import necessary types and functions for calculateBestRouteService
import {
  BuildSplitTradeReturn,
  BuildTradeReturn,
  PlatformType,
  Protocol,
  SwapRouteRequest,
  SwapRouteSplitRequest,
  ExactInBuildTradeReturn, // Import ExactInBuildTradeReturn
  ExactInSplitBuildTradeReturn, // Import ExactInSplitBuildTradeReturn
  ExactOutBuildTradeReturn, // Import ExactOutBuildTradeReturn
  ExactOutSplitBuildTradeReturn, // Import ExactOutSplitBuildTradeReturn
} from 'state/routing/types';
import { CurrencyAmount as AmountAsset } from 'interfaces';
import { getPairAddress } from 'functions/getPairAddress';
import { reservesBNWithTokens } from 'hooks/useReserves'; // This is a hook, need to check if it can be used or replaced
import { getExpectedAmount } from 'functions/getExpectedAmount';
import { Networks } from '@stellar/stellar-sdk';
import { getSwapRoute, getSwapSplitRoute } from 'services/soroswapApi';
import { passphraseToBackendNetworkName } from 'services/pairs';
import { getBestPath, getHorizonBestPath } from 'helpers/horizon/getHorizonPath'; // Import getBestPath and getHorizonBestPath
import { ProtocolsStatus } from 'contexts'; // Import ProtocolsStatus

export interface CalculateRouteServiceProps {
  amountAsset: AmountAsset;
  quoteAsset: TokenType;
  amount: string;
  tradeType: TradeType;
  currentProtocolsStatus: ProtocolsStatus[];
  sorobanContext: SorobanContextType;
  factory: string | undefined; // Assuming factory address is a string
  maxHops: number;
  protocolsStatus: ProtocolsStatus[];
  isAggregator: boolean;
  isExactIn: boolean;
}

const shouldUseDirectPath = process.env.NEXT_PUBLIC_DIRECT_PATH_ENABLED === 'true';

export const calculateBestRouteService = async ({
  amountAsset,
  quoteAsset,
  amount,
  tradeType,
  currentProtocolsStatus,
  sorobanContext,
  factory,
  maxHops,
  protocolsStatus,
  isAggregator,
  isExactIn
}: CalculateRouteServiceProps): Promise<BuildTradeReturn | BuildSplitTradeReturn | undefined> => {

  if (shouldUseDirectPath) {
    try {


      // get pair address from factory
      const pairAddress = await getPairAddress(
        isExactIn ? amountAsset.currency.contract : quoteAsset.contract,
        isExactIn ? quoteAsset.contract : amountAsset.currency.contract,
        sorobanContext,
      );

      // Get reserves from pair
      // reservesBNWithTokens is a hook, need to find an alternative
      const reserves = await reservesBNWithTokens(pairAddress, sorobanContext);
      if (!reserves?.reserve0 || !reserves?.reserve1) {
        throw new Error('Reserves not found');
      }


      // Get amountOut or amountIn from reserves and tradeType
      // getExpectedAmount is a function, can be used directly
      let quoteAmount = await getExpectedAmount(
        isExactIn ? amountAsset.currency : quoteAsset,
        isExactIn ? quoteAsset : amountAsset.currency,
        new BigNumber(amount),
        sorobanContext,
        tradeType,
      );

      // Convert from lumens to stroops (multiply by 10^7)
     const quoteAmountInteger = quoteAmount.integerValue();

      const toReturn: BuildTradeReturn =
        tradeType === TradeType.EXACT_INPUT
          ? {
            assetIn: amountAsset.currency.contract,
            assetOut: quoteAsset.contract,
            priceImpact: {
              numerator: 0,
              denominator: 1,
            },
            platform: PlatformType.ROUTER,
            tradeType: TradeType.EXACT_INPUT,
            trade: {
              amountIn: BigInt(amountAsset.value),
              amountOutMin: BigInt(quoteAmountInteger.toString()),
              path: [amountAsset.currency.contract, quoteAsset.contract],
            }
          }
          : {
            assetIn: amountAsset.currency.contract,
            assetOut: quoteAsset.contract,
            priceImpact: {
              numerator: 0,
              denominator: 1,
            },
            platform: PlatformType.ROUTER,
            tradeType: TradeType.EXACT_OUTPUT,
            trade: {
              amountOut: BigInt(amount),
              amountInMax: BigInt(quoteAmountInteger.toString()),
              path: [quoteAsset.contract, amountAsset.currency.contract],
            },
          };

      return toReturn;
    } catch (error) {
      console.error('Error generating direct path:', error);
      throw error;
    }
  }
  if (!factory) throw new Error('Factory address not found');

  const isHorizonEnabled = currentProtocolsStatus.find(
    (p) => p.key === PlatformType.STELLAR_CLASSIC,
  )?.value;

  const isSoroswapEnabled = currentProtocolsStatus.find((p) => p.key === Protocol.SOROSWAP)
    ?.value;
  
  const horizonProps = {
    assetFrom: isExactIn ? amountAsset.currency : quoteAsset,
    assetTo: isExactIn ? quoteAsset : amountAsset.currency,
    amount,
    tradeType,
  };

  let horizonPath: BuildTradeReturn | undefined;
  if (isHorizonEnabled) {
    horizonPath = (await getHorizonBestPath(horizonProps, sorobanContext)) as BuildTradeReturn;
  }

  let sorobanPath: BuildTradeReturn | BuildSplitTradeReturn | undefined;
  if (isAggregator) {
    const swapSplitRequest: SwapRouteSplitRequest = {
      assetIn: isExactIn ? amountAsset.currency.contract : quoteAsset.contract,
      assetOut: isExactIn ? quoteAsset.contract : amountAsset.currency.contract,
      amount: amount,
      tradeType: tradeType,
      protocols: protocolsStatus.filter(p => p.key !== PlatformType.STELLAR_CLASSIC && p.value).map(p => p.key as Protocol),
      parts: 10,
      slippageTolerance: '0.01', // TODO: Use actual slippage
      assetList: ['SOROSWAP'], // TODO: Use actual asset list
    };

    try {
      const networkName = passphraseToBackendNetworkName[sorobanContext.activeNetwork ?? Networks.TESTNET];
      const response = await getSwapSplitRoute(networkName, swapSplitRequest);
      sorobanPath = response;
    } catch (error) {
      console.error('Error getting soroban split path:', error);
      return undefined;
    }
  } else if (isSoroswapEnabled) {
    const swapRequest: SwapRouteRequest = {
      assetIn: isExactIn ? amountAsset.currency.contract : quoteAsset.contract,
      assetOut: isExactIn ? quoteAsset.contract : amountAsset.currency.contract,
      amount: amount,
      tradeType: tradeType,
      slippageTolerance: '0.01', // TODO: Use actual slippage
      assetList: ['SOROSWAP'], // TODO: Use actual asset list
    };

    try {
      const networkName = passphraseToBackendNetworkName[sorobanContext.activeNetwork ?? Networks.TESTNET];
      const response = await getSwapRoute(networkName, swapRequest);
      sorobanPath = response;
    } catch (error) {
      console.error('Error getting soroban path:', error);
      return undefined;
    }
  }
  const bestPath = getBestPath(horizonPath, sorobanPath, tradeType);
  return bestPath;
};

export const getDerivedSwapInfoService = async (
  state: SwapState,
  sorobanContext: SorobanContextType,
  account: string | undefined | null,
  tokensAsMap: TokenMapType,
  horizonAccount: AccountResponse | undefined, // Accept AccountResponse as argument
  allowedSlippage: any, // Accept allowedSlippage as argument
  // Add arguments for calculateBestRouteService dependencies
  factory: string | undefined,
  maxHops: number,
  protocolsStatus: ProtocolsStatus[],
  isAggregator: boolean,
): Promise<SwapInfoService> => {

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = state;



  // Fetch input and output tokens using findTokenService
  const inputCurrency = await findTokenService(inputCurrencyId ?? undefined, tokensAsMap, sorobanContext);
  
  const outputCurrency = await findTokenService(outputCurrencyId ?? undefined, tokensAsMap, sorobanContext);

  const tokensArray = inputCurrency && outputCurrency ? [inputCurrency, outputCurrency] : undefined;

  // Fetch relevant token balances
  let relevantTokenBalances: { [field in Field]?: relevantTokensType | string | undefined } | undefined;
  if (account && tokensArray && horizonAccount) { // Use passed horizonAccount
    const balancesResult = await tokenBalances(account, tokensArray, sorobanContext, horizonAccount);
    // Transform the balances array into an object with INPUT and OUTPUT fields
    relevantTokenBalances = {
      [Field.INPUT]: balancesResult?.balances?.[0] ?? '', // Assuming the order is always input then output
      [Field.OUTPUT]: balancesResult?.balances?.[1] ?? '',
    };
  }

  const isExactIn: boolean = independentField === Field.INPUT;
  const parsedAmount = tryParseCurrencyAmount(typedValue, inputCurrency ?? undefined);

  // Fetch best trade using the new service function
  let trade: any = { trade: undefined, state: TradeState.STALE }; // Initial state

  if (parsedAmount && inputCurrency && outputCurrency) {
    trade.state = TradeState.LOADING; // Set loading state before the async call
    try {
      const route = await calculateBestRouteService({
        amountAsset: parsedAmount,
        quoteAsset: outputCurrency,
        amount: parsedAmount.value, // Use typedValue for the amount
        tradeType: isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
        currentProtocolsStatus: protocolsStatus, // Pass protocolsStatus
        sorobanContext,
        factory, // Pass factory
        maxHops, // Pass maxHops
        protocolsStatus, // Pass protocolsStatus again? Check if needed twice
        isAggregator, // Pass isAggregator
        isExactIn: isExactIn
      });

      // Map the route result to the trade structure expected by SwapInfoService
      let inputAmount: CurrencyAmount | undefined;
      let outputAmount: CurrencyAmount | undefined;

      if (route) {
        // Use type guards to narrow down the type of the route and access trade details
        if (route.tradeType === TradeType.EXACT_INPUT) {
          const exactInRoute = route as ExactInBuildTradeReturn | ExactInSplitBuildTradeReturn;
          const tradeDetails = exactInRoute.trade;
          inputAmount = { currency: inputCurrency, value: tradeDetails.amountIn.toString() };
          outputAmount = { currency: outputCurrency, value: tradeDetails.amountOutMin.toString() };
        } else { // TradeType.EXACT_OUTPUT
          const exactOutRoute = route as ExactOutBuildTradeReturn | ExactOutSplitBuildTradeReturn;
          const tradeDetails = exactOutRoute.trade;
          inputAmount = { currency: inputCurrency, value: tradeDetails.amountInMax.toString() };
          outputAmount = { currency: outputCurrency, value: tradeDetails.amountOut.toString() };
        }
      }

      trade = {
        trade: {
          inputAmount: inputAmount,
          outputAmount: outputAmount,
          state: route ? TradeState.VALID : TradeState.NO_ROUTE_FOUND,
          path: (route?.trade as any)?.path,
          distribution: (route?.trade as any)?.distribution,
          expectedAmount: route?.tradeType === TradeType.EXACT_INPUT ? (route?.trade as any)?.amountOutMin?.toString() : (route?.trade as any)?.amountInMax?.toString(),
          assetIn: route?.assetIn,
          assetOut: route?.assetOut,
          priceImpact: route?.priceImpact,
          platform: route?.platform,
          tradeType: route?.tradeType,
        },
      };
    } catch (error) {
      console.error("Error calculating best route:", error);
      trade.state = TradeState.INVALID; // Set state to invalid on error
      // Optionally set an error message in trade.error
    }
  }


  // Calculate input error
  let inputError: ReactNode | undefined;

  if (!account) {
    inputError = 'Connect Wallet';
  }

  if (!inputCurrency || !outputCurrency) {
    inputError = inputError ?? 'Select a token';
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount';
  }

  const formattedTo = isAddress(recipient ?? '');
  if (!recipient || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient';
  }

  // Check for insufficient liquidity
  if (
    trade.trade?.outputAmount?.value?.includes('Infinity') ||
    trade.trade?.outputAmount?.value?.includes('-')
  ) {
    inputError = 'Insufficient liquidity for this trade.';
  }

  // Check for insufficient balance
  const balanceIn: string | relevantTokensType | undefined = relevantTokenBalances ? relevantTokenBalances[Field.INPUT] : undefined; // Get the balance for the input currency from the object
  const maxAmountIn: string | number = trade.trade?.inputAmount?.value ?? 0;

  if (
    balanceIn &&
    typeof balanceIn !== 'string' &&
    BigNumber(balanceIn.balance!).isLessThan(BigNumber(maxAmountIn)) // Use isLessThan for strict comparison
  ) {
    inputError = `Insufficient ${balanceIn.code} balance`;
  }


  return {
    currencies: {
      [Field.INPUT]: inputCurrency,
      [Field.OUTPUT]: outputCurrency,
    },
    currencyBalances: relevantTokenBalances ?? {}, // Use the fetched balances, provide empty object if undefined
    parsedAmount: parsedAmount, // Use the parsed amount
    inputError: inputError, // Use the calculated input error
    trade: trade, // Use the fetched trade
    allowedSlippage: allowedSlippage, // Use the calculated slippage
    autoSlippage: undefined, // Auto slippage is not directly used in the return type
  };
};



