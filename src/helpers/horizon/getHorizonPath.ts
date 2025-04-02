import { ServerApi } from '@stellar/stellar-sdk/lib/horizon';
import { Asset } from '@stellar/stellar-sdk';
import { SorobanContextType } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { CurrencyAmount, TokenType } from 'interfaces';
import {
  BuildSplitTradeReturn,
  BuildTradeReturn,
  ExactInBuildTradeReturn,
  ExactInSplitBuildTradeReturn,
  ExactOutBuildTradeReturn,
  ExactOutSplitBuildTradeReturn,
  PlatformType,
  TradeType,
} from 'state/routing/types';

const getClassicAsset = (currency: TokenType) => {
  if (!currency) return;
  if (currency?.code === 'XLM') {
    const nativeAsset = Asset.native();
    return nativeAsset;
  }
  if (!currency.issuer) {
    //throw new Error(`Can't convert ${currency.code} to stellar classic asset`);
    return;
  }
  const asset = new Asset(currency.code, currency.issuer);
  return asset;
};

export const getAmount = (amount: string) => {
  if (!amount) return;
  return new BigNumber(amount).dividedBy(10000000).toString();
};

const getPools = async (path: any, sorobanContext: SorobanContextType) => {
  const { serverHorizon } = sorobanContext;
  if (!serverHorizon) return;
  const pathPairs = [];
  for (let i = 0; i < path.length - 1; i++) {
    const pair = [path[i], path[i + 1]];
    pathPairs.push(pair);
  }
  const pools = await Promise.all(
    pathPairs.map(async (pair) => {
      try {
        const response = await serverHorizon
          ?.liquidityPools()
          .forAssets(...pair)
          .call();
        const reserve_A = parseFloat(response.records[0].reserves[0].amount);
        const reserve_B = parseFloat(response.records[0].reserves[1].amount);
        const constant = reserve_A * reserve_B;
        const poolReserves = {
          ...response.records[0].reserves,
          constant: constant,
        };
        return poolReserves;
      } catch (e) {
        console.error(e);
      }
    }),
  );
  return pools;
};

const calculateExactInPriceImpact = (pool: any, amount: any) => {
  const reserve_A = parseFloat(pool[0].amount);
  const reserve_B = parseFloat(pool[1].amount);
  const newReserve_A = reserve_A + parseFloat(amount);
  const constant = pool.constant;
  const price_A = constant / reserve_B;
  const newReserve_B = constant / newReserve_A;
  const newPrice_A = constant / newReserve_B;
  const priceImpact = ((newPrice_A - price_A) / price_A) * 100;
  return priceImpact;
};

const calculateExactOutPriceImpact = (pool: any, amount: any) => {
  const reserve_A = parseFloat(pool[0].amount);
  const reserve_B = parseFloat(pool[1].amount);
  const newReserve_B = reserve_B + parseFloat(amount);
  const constant = pool.constant;
  const price_B = constant / reserve_A;
  const newReserve_A = constant / newReserve_B;
  const newPrice_B = constant / newReserve_A;
  const priceImpact = ((newPrice_B - price_B) / price_B) * 100;
  return priceImpact;
};

const calculateAveragePriceImpact = (pools: any, amount: any, tradeType: TradeType) => {
  const priceImpacts = pools.map((pool: any) => {
    if (tradeType === TradeType.EXACT_INPUT) {
      return calculateExactInPriceImpact(pool, amount);
    } else {
      return calculateExactOutPriceImpact(pool, amount);
    }
  });
  const averagePriceImpact =
    priceImpacts.reduce((a: number, b: number) => a + b, 0) / priceImpacts.length;
  return averagePriceImpact;
};

export const parseHorizonResult = async (
  payload: ServerApi.PaymentPathRecord | undefined,
  tradeType: TradeType,
  sorobanContext: SorobanContextType,
) => {
  if (!payload) return;
  const currecnyIn: TokenType =
    payload.source_asset_type == 'native'
      ? {
          code: 'XLM',
          contract: '',
        }
      : {
          code: payload.source_asset_code,
          issuer: payload.source_asset_issuer,
          contract: `${payload.source_asset_code}:${payload.source_asset_issuer}`,
        };
  const currencyOut: TokenType =
    payload.destination_asset_type == 'native'
      ? {
          code: 'XLM',
          contract: '',
        }
      : {
          code: payload.destination_asset_code,
          issuer: payload.destination_asset_issuer,
          contract: `${payload.destination_asset_code}:${payload.destination_asset_issuer}`,
        };
  const inputAmount: CurrencyAmount = {
    currency: currecnyIn,
    value: new BigNumber(payload.source_amount).multipliedBy(10000000).toString(),
  };
  const outputAmount: CurrencyAmount = {
    currency: currencyOut,
    value: new BigNumber(payload.destination_amount).multipliedBy(10000000).toString(),
  };
  const parsedPath = payload.path.map((asset) => {
    if (asset.asset_type == 'native') return 'XLM';
    return `${asset.asset_code}:${asset.asset_issuer}`;
  });
  const poolsPath = payload.path.map((asset) => {
    if (asset.asset_type == 'native') return 'native';
    return `${asset.asset_code}:${asset.asset_issuer}`;
  });
  const addressFrom =
    !currecnyIn.issuer && currecnyIn.code === 'XLM'
      ? 'native'
      : currecnyIn.issuer
      ? `${currecnyIn.code}:${currecnyIn.issuer}`
      : `${currecnyIn.code}`;
  const addressTo =
    !currencyOut.issuer && currencyOut.code === 'XLM'
      ? 'native'
      : currencyOut.issuer
      ? `${currencyOut.code}:${currencyOut.issuer}`
      : `${currencyOut.code}`;

  const formattedPath = [addressFrom, ...parsedPath, addressTo];

  const pools = await getPools([addressFrom, ...poolsPath, addressTo], sorobanContext);

  const ammountToCalculate =
    tradeType === TradeType.EXACT_INPUT ? payload.source_amount : payload.destination_amount;
  const priceImpact = calculateAveragePriceImpact(pools, ammountToCalculate, tradeType);

  const result: BuildTradeReturn =
    tradeType === TradeType.EXACT_INPUT
      ? {
          assetIn: inputAmount.currency.contract,
          assetOut: outputAmount.currency.contract,
          priceImpact: {
            numerator: priceImpact,
            denominator: 100,
          },
          platform: PlatformType.STELLAR_CLASSIC,
          tradeType: TradeType.EXACT_INPUT,
          trade: {
            amountIn: BigInt(inputAmount.value),
            amountOutMin: BigInt(outputAmount.value),
            path: formattedPath,
          },
        }
      : {
          assetIn: inputAmount.currency.contract,
          assetOut: outputAmount.currency.contract,
          priceImpact: {
            numerator: priceImpact,
            denominator: 100,
          },
          platform: PlatformType.STELLAR_CLASSIC,
          tradeType: TradeType.EXACT_OUTPUT,
          trade: {
            amountOut: BigInt(outputAmount.value),
            amountInMax: BigInt(inputAmount.value),
            path: formattedPath,
          },
        };

  return result;
};

export interface HorizonBestPathProps {
  assetFrom: TokenType;
  assetTo: TokenType;
  amount: string;
  tradeType: TradeType;
}

export function getHorizonBestPath(
  payload: HorizonBestPathProps,
  sorobanContext: SorobanContextType,
) {
  if (!payload.assetFrom || !payload.assetTo || !payload.amount || !sorobanContext) {
    return;
  }
  const { serverHorizon, activeChain } = sorobanContext;
  if (!serverHorizon || !activeChain) {
    console.error('no serverHorizon or activeChain');
  }
  const args = {
    assetFrom: getClassicAsset(payload.assetFrom),
    assetTo: getClassicAsset(payload.assetTo),
    amount: getAmount(payload.amount),
  };
  if (!args.amount || !args.assetFrom || !args.assetTo || !serverHorizon) return;
  if (payload.tradeType === TradeType.EXACT_INPUT) {
    try {
      const send = serverHorizon
        .strictSendPaths(args.assetFrom, args.amount, [args.assetTo])
        .call()
        .then((res) => res.records);
      return send
        ?.then((res) => {
          const maxObj = res.reduce((maxObj, obj) => {
            if (maxObj.path.length <= 1) {
            }
            if (obj.destination_amount > maxObj.destination_amount && obj.path.length <= 1) {
              return obj;
            } else {
              return maxObj;
            }
          });
          return parseHorizonResult(maxObj, payload.tradeType, sorobanContext);
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      console.error(error);
    }
  } else if (payload.tradeType === TradeType.EXACT_OUTPUT) {
    try {
      const receive = serverHorizon
        .strictReceivePaths([args.assetTo], args.assetFrom, args.amount)
        .call()
        .then((res) => res.records);
      return receive?.then((res) => {
        const minObj = res.reduce((minObj, obj) => {
          if (obj.destination_amount < minObj.destination_amount) {
            return obj;
          } else {
            return minObj;
          }
        });
        return parseHorizonResult(minObj, payload.tradeType, sorobanContext);
      });
    } catch (error) {
      console.error(error);
    }
  }
}

export const getBestPath = (
  horizonPath: BuildTradeReturn | undefined,
  routerPath: BuildTradeReturn | BuildSplitTradeReturn | undefined,
  tradeType: TradeType,
): BuildTradeReturn | BuildSplitTradeReturn | undefined => {
  if (!tradeType) throw new Error('Trade type not found');
  if (!horizonPath) return routerPath;
  if (!routerPath) return horizonPath;
  if (tradeType === TradeType.EXACT_INPUT) {
    const horizonAmountOutMin = parseInt(
      (horizonPath as ExactInBuildTradeReturn)?.trade.amountOutMin.toString() || '0',
    );
    const routerAmountOutMin = parseInt(
      (
        routerPath as ExactInBuildTradeReturn | ExactInSplitBuildTradeReturn
      )?.trade.amountOutMin?.toString() || '0',
    );
    if (horizonAmountOutMin !== 0 && routerAmountOutMin !== 0) {
      if (routerAmountOutMin > horizonAmountOutMin) return routerPath;
      else return horizonPath;
    }
  } else if (tradeType === TradeType.EXACT_OUTPUT) {
    const horizonAmountInMax = parseInt(
      (horizonPath as ExactOutBuildTradeReturn)?.trade.amountInMax.toString() || '0',
    );
    const routerAmountInMax = parseInt(
      (
        routerPath as ExactOutBuildTradeReturn | ExactOutSplitBuildTradeReturn
      )?.trade.amountInMax.toString() || '0',
    );
    if (horizonAmountInMax !== 0 && routerAmountInMax !== 0) {
      if (routerAmountInMax < horizonAmountInMax) return routerPath;
      else return horizonPath;
    }
  }
};
