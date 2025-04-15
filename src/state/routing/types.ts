import { DexDistribution } from 'helpers/aggregator';
import { CurrencyAmount } from 'interfaces';

export enum TradeState {
  LOADING,
  INVALID,
  STALE,
  NO_ROUTE_FOUND,
  VALID,
}

export enum QuoteMethod {
  ROUTING_API = 'ROUTING_API',
  CLIENT_SIDE = 'CLIENT_SIDE',
  CLIENT_SIDE_FALLBACK = 'CLIENT_SIDE_FALLBACK', // If client-side was used after the routing-api call failed.
}

export enum TradeType {
  EXACT_INPUT = 'EXACT_IN',
  EXACT_OUTPUT = 'EXACT_OUT',
}

export enum PlatformType {
  AGGREGATOR = 'Soroswap Aggregator',
  ROUTER = 'Soroswap AMM',
  STELLAR_CLASSIC = 'SDEX',
}

// TODO: Here you should add any other new protocols like Aqua or Comet
export enum Protocol {
  SOROSWAP = 'soroswap',
  PHOENIX = 'phoenix',
  AQUA = 'aqua',
}

export interface MercuryPair {
  tokenA: string;
  tokenB: string;
  address: string;
  reserveA: string;
  reserveB: string;
}

export type SwapRouteRequest = {
  assetIn: string;
  assetOut: string;
  amount: string;
  tradeType: string;
  slippageTolerance: string;
  assetList?: string[];
};

export type SwapRouteSplitRequest = {
  assetIn: string;
  assetOut: string;
  amount: string;
  tradeType: string;
  protocols: string[];
  parts: number;
  slippageTolerance: string;
  assetList?: string[];
};

interface CommonBuildTradeReturnFields {
  assetIn: string;
  assetOut: string;
  priceImpact: {
    numerator: number;
    denominator: number;
  };
  platform?: PlatformType;
}

export interface ExactInBuildTradeReturn extends CommonBuildTradeReturnFields {
  tradeType: TradeType.EXACT_INPUT;
  trade: {
    amountIn: bigint;
    amountOutMin: bigint;
    path: string[];
  };
}

export interface ExactOutBuildTradeReturn extends CommonBuildTradeReturnFields {
  tradeType: TradeType.EXACT_OUTPUT;
  trade: {
    amountOut: bigint;
    amountInMax: bigint;
    path: string[];
  };
}

export interface ExactInSplitBuildTradeReturn extends CommonBuildTradeReturnFields {
  tradeType: TradeType.EXACT_INPUT;
  trade: {
    amountIn: bigint;
    amountOutMin: bigint;
    distribution: DexDistribution[];
  };
}

export interface ExactOutSplitBuildTradeReturn extends CommonBuildTradeReturnFields {
  tradeType: TradeType.EXACT_OUTPUT;
  trade: {
    amountOut: bigint;
    amountInMax: bigint;
    distribution: DexDistribution[];
  };
}

export type BuildTradeReturn = ExactInBuildTradeReturn | ExactOutBuildTradeReturn;

export type BuildSplitTradeReturn = ExactInSplitBuildTradeReturn | ExactOutSplitBuildTradeReturn;

export type InterfaceTrade = {
  inputAmount: CurrencyAmount | undefined;
  outputAmount: CurrencyAmount | undefined;
  tradeType: TradeType | undefined;
  path: string[] | undefined;
  distribution?: DexDistribution[] | undefined;
  priceImpact?: {
    numerator: number;
    denominator: number;
  };
  [x: string]: any;
  platform?: PlatformType;
};

export enum QuoteState {
  SUCCESS = 'Success',
  NOT_FOUND = 'Not found',
}

// export type QuoteResult =
//   | {
//       state: QuoteState.NOT_FOUND
//       data?: undefined
//     }
//   | {
//       state: QuoteState.SUCCESS
//       data: URAQuoteResponse
//     }

// export type TradeResult =
//   | {
//       state: QuoteState.NOT_FOUND
//       trade?: undefined
//     }
//   | {
//       state: QuoteState.SUCCESS
//       trade: InterfaceTrade
//     }

// export enum PoolType {
//   V2Pool = 'v2-pool',
//   V3Pool = 'v3-pool',
// }

// // swap router API special cases these strings to represent native currencies
// // all chains except for bnb chain and polygon
// // have "ETH" as native currency symbol
// export enum SwapRouterNativeAssets {
//   MATIC = 'MATIC',
//   BNB = 'BNB',
//   AVAX = 'AVAX',
//   ETH = 'ETH',
// }

// export enum URAQuoteType {
//   CLASSIC = 'CLASSIC',
//   DUTCH_LIMIT = 'DUTCH_LIMIT',
// }

// type ClassicAPIConfig = {
//   protocols: Protocol[]
// }

// type UniswapXConfig = {
//   swapper?: string
//   exclusivityOverrideBps?: number
//   auctionPeriodSecs?: number
// }

// export type RoutingConfig = (UniswapXConfig | ClassicAPIConfig)[]
