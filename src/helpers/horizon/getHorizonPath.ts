import { ServerApi } from '@stellar/stellar-sdk/lib/horizon';
import { Asset } from '@stellar/stellar-sdk'
import { SorobanContextType } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { CurrencyAmount, TokenType } from 'interfaces';
import { PlatformType, TradeType } from 'state/routing/types';
import { Percent } from 'soroswap-router-sdk';
import { BuildTradeRoute } from 'functions/generateRoute';



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

export const getAmount = (amount: string) => {
  if (!amount) return;
  return new BigNumber(amount).dividedBy(10000000).toString()
}

export const parseHorizonResult = (payload: ServerApi.PaymentPathRecord | undefined, tradeType: TradeType) => {
  if (!payload) return;
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
  const defaultPath = payload.path.map((asset) => {
    return `${asset.asset_code}:${asset.asset_issuer}`
  })
  const addressFrom = !currecnyIn.issuer && currecnyIn.code === 'XLM' ? 'native' : currecnyIn.issuer ? `${currecnyIn.code}:${currecnyIn.issuer}` : `${currecnyIn.code}`
  const addressTo = !currencyOut.issuer && currencyOut.code === 'XLM' ? 'native' : currencyOut.issuer ? `${currencyOut.code}:${currencyOut.issuer}` : `${currencyOut.code}`
  const formattedPath = [addressFrom, ...defaultPath, addressTo]
  let trade;
  if (tradeType === TradeType.EXACT_INPUT) {
    trade = {
      amountIn: inputAmount.value,
      amountOutMin: outputAmount.value,
      path: formattedPath
    }
  } else {
    trade = {
      amountOut: outputAmount.value,
      amountInMax: inputAmount.value,
      path: formattedPath
    }
  }
  const priceImpact = new Percent(0)
  const result = {
    amountCurrency: inputAmount,
    quoteCurrency: outputAmount,
    tradeType: tradeType,
    routeCurrency:[currecnyIn, ...payload.path, currencyOut],
    trade: trade,
    priceImpact: priceImpact,
    platform: PlatformType.STELLAR_CLASSIC,
  }
  return result
} 

export interface HorizonBestPathProps {
  assetFrom: TokenType;
  assetTo: TokenType;
  amount: string;
  tradeType: TradeType;
}

export function getHorizonBestPath(
  payload: HorizonBestPathProps,
  sorobanContext: SorobanContextType
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
    amount: getAmount(payload.amount)
  };

  if (payload.tradeType === TradeType.EXACT_INPUT) {
    try {
      const send = serverHorizon?.strictSendPaths(
        args.assetFrom!,
        args?.amount!,
        [args.assetTo!]
      ).call().then((res) => {
        return res.records;
      });
      return send?.then(res => {
        const maxObj = res.reduce((maxObj, obj) => {
          if (obj.destination_amount > maxObj.destination_amount) {
        return obj;
          } else {
        return maxObj;
          }
        });
        return parseHorizonResult(maxObj, payload.tradeType);
      });
    } catch (error) {
      console.error(error);
    }
  }

  if (payload.tradeType === TradeType.EXACT_OUTPUT) {
    try {
      const receive = serverHorizon?.strictReceivePaths(
        [args.assetFrom!],
        args.assetTo!,
        args?.amount!,
      ).call().then((res) => {
        return res.records;
      });

      return receive?.then(res => {
        const minObj = res.reduce((minObj, obj) => {
          if (obj.destination_amount < minObj.destination_amount) {
            return obj;
          } else {
            return minObj;
          }
        });
        return parseHorizonResult(minObj, payload.tradeType);
      });
    } catch (error) {
      console.error(error);
    }
  }
}

export const getBestPath = (horizonPath: BuildTradeRoute, routerPath: BuildTradeRoute, tradeType: TradeType)=>{
  if(!tradeType) return;
  if(!horizonPath) return routerPath
  if(!routerPath) return horizonPath
  if (tradeType === TradeType.EXACT_INPUT) {
    const horizonAmountOutMin = parseInt(horizonPath?.trade.amountOutMin || '0');
    const routerAmountOutMin = parseInt(routerPath?.trade.amountOutMin || '0');
    if (horizonAmountOutMin !== 0 && routerAmountOutMin !== 0) {
      if (routerAmountOutMin > horizonAmountOutMin) return routerPath;
      else return horizonPath;
    } 
  } else if (tradeType === TradeType.EXACT_OUTPUT) {
    const horizonAmountInMax = parseInt(horizonPath?.trade.amountInMax || '0');
    const routerAmountInMax = parseInt(routerPath?.trade.amountInMax || '0');
    if (horizonAmountInMax !== 0 && routerAmountInMax !== 0) {
      if (routerAmountInMax < horizonAmountInMax) return routerPath; 
      else return horizonPath;
    }
  }
}