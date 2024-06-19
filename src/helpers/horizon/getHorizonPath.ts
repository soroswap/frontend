import { ServerApi } from '@stellar/stellar-sdk/lib/horizon';
import { Asset } from '@stellar/stellar-sdk'
import { SorobanContextType } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { CurrencyAmount, TokenType } from 'interfaces';
import { InterfaceTrade, PlatformType, QuoteState, TradeState, TradeType } from 'state/routing/types';

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
    platform: PlatformType.STELLAR_CLASSIC,
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