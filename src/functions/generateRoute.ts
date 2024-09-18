import { useSorobanReact } from '@soroban-react/core';
import { AppContext } from 'contexts';
import { useFactory } from 'hooks';
import { useAggregator } from 'hooks/useAggregator';
import { useContext, useEffect, useMemo } from 'react';
import { fetchAllPhoenixPairs, fetchAllSoroswapPairs } from 'services/pairs';
import {
  Currency,
  CurrencyAmount,
  Networks,
  Percent,
  Protocols,
  Route,
  Router,
  Token,
  TradeType,
} from 'soroswap-router-sdk';
import { TokenType } from 'interfaces';
import { getBestPath, getHorizonBestPath } from 'helpers/horizon/getHorizonPath';
import { PlatformType } from 'state/routing/types';
import { CurrencyAmount as AmountAsset } from 'interfaces';
import { DexDistribution } from 'helpers/aggregator';

export interface BuildTradeRoute {
  amountCurrency: AmountAsset | CurrencyAmount<Currency>;
  quoteCurrency: AmountAsset | CurrencyAmount<Currency>;
  tradeType: TradeType;
  trade: {
    amountIn?: string;
    amountOut?: string;
    amountOutMin?: string;
    amountInMax?: string;
    distribution?: DexDistribution[];
    path: string[];
  };
  priceImpact: Percent | Number;
  platform: PlatformType;
}

export interface GenerateRouteProps {
  amountAsset: AmountAsset;
  quoteAsset: TokenType;
  amount: string;
  tradeType: TradeType;
  currentProtocolsStatus: { key: string; value: boolean }[];
}

const queryNetworkDict: { [x: string]: 'MAINNET' | 'TESTNET' } = {
  [Networks.PUBLIC]: 'MAINNET',
  [Networks.TESTNET]: 'TESTNET',
};

const shouldUseBackend = process.env.NEXT_PUBLIC_SOROSWAP_BACKEND_ENABLED === 'true';

export const useRouterSDK = () => {
  const sorobanContext = useSorobanReact();
  const { factory } = useFactory(sorobanContext);
  const { isEnabled: isAggregator } = useAggregator();

  const { Settings } = useContext(AppContext);
  const { maxHops, protocolsStatus, setProtocolsStatus } = Settings;

  const network = sorobanContext.activeChain?.networkPassphrase as Networks;

  const getValuebyKey = (key: string) => {
    let value = protocolsStatus.find((p) => p.key === key)?.value;
    // Soroswap will be activatewd by defaul
    if (value === undefined && key === Protocols.SOROSWAP) {
      return true;
    }
    // SDEX will be activated by defaul
    if (value === undefined && key === PlatformType.STELLAR_CLASSIC) {
      return true;
    }
    if (typeof value === 'undefined') {
      return false;
    }
    if (value === true || value === false) {
      return value;
    }
    return value;
  }

  const getDefaultProtocolsStatus = async (network: Networks) => {
    switch (network) {
      case Networks.PUBLIC:
        // here you should add your new supported protocols
        return [
          { key: Protocols.SOROSWAP , value: getValuebyKey(Protocols.SOROSWAP) },
          { key: PlatformType.STELLAR_CLASSIC, value: getValuebyKey(PlatformType.STELLAR_CLASSIC) },
        ];
      case Networks.TESTNET:
        return [
          { key: Protocols.SOROSWAP, value: getValuebyKey(Protocols.SOROSWAP) },
          { key: Protocols.PHOENIX, value: getValuebyKey(Protocols.PHOENIX) },
        ];
      default:
        return [
          { key: Protocols.SOROSWAP, value: true },
          { key: Protocols.PHOENIX, value: false },
          { key: PlatformType.STELLAR_CLASSIC, value: true },
        ];
    }
  }

  useEffect(() => {
    const fetchProtocolsStatus = async () => {
      const defaultProtocols = await getDefaultProtocolsStatus(network);
      setProtocolsStatus(defaultProtocols);
    };
    fetchProtocolsStatus();
  }, [network]);

  const getPairsFns = useMemo(() => {
    const routerProtocols = []
    if(!shouldUseBackend) return undefined
//  here you should add your new supported aggregator protocols
    for(let protocol of protocolsStatus){
      if(protocol.key === Protocols.SOROSWAP && protocol.value === true){
        routerProtocols.push({protocol: Protocols.SOROSWAP, fn: async () => fetchAllSoroswapPairs(network)});
      }
      if(protocol.key === Protocols.PHOENIX && protocol.value === true){
        routerProtocols.push({protocol: Protocols.PHOENIX, fn: async () => fetchAllPhoenixPairs(network)});
      }
    }
    return routerProtocols;
  }, [network, protocolsStatus]);

  const getProtocols = useMemo(() => {
    const newProtocols = [];
    for(let protocol of protocolsStatus){
      if(protocol.key != PlatformType.STELLAR_CLASSIC && protocol.value === true){
        newProtocols.push(protocol.key);
      }
    }
    return newProtocols as Protocols[];
  },[protocolsStatus]);

  const router = useMemo(() => {
    return new Router({
      getPairsFns: getPairsFns,
      pairsCacheInSeconds: 5,
      protocols: getProtocols,
      network,
      maxHops,
    });
  }, [network, maxHops, isAggregator, protocolsStatus]);

  const isProtocolEnabled = (protocol: any) => {
    return protocolsStatus.find((p) => p.key === protocol)?.value;
  }

  const fromAddressToToken = (address: string) => {
    return new Token(network, address, 18);
  };

  const fromAddressAndAmountToCurrencyAmount = (address: string, amount: string) => {
    const token = fromAddressToToken(address);
    return CurrencyAmount.fromRawAmount(token, amount);
  };

  const resetRouterSdkCache = () => {
    router.resetCache();
  };

  const generateRoute = async ({
    amountAsset,
    quoteAsset,
    amount,
    tradeType,
    currentProtocolsStatus,
  }: GenerateRouteProps) => {
    if (!factory) throw new Error('Factory address not found');
    const currencyAmount = fromAddressAndAmountToCurrencyAmount(
      amountAsset.currency.contract,
      amount,
    );
    const quoteCurrency = fromAddressToToken(quoteAsset.contract);

    const isHorizonEnabled = currentProtocolsStatus.find((p) => p.key === PlatformType.STELLAR_CLASSIC)?.value; 

    const isSoroswapEnabled = currentProtocolsStatus.find((p) => p.key === Protocols.SOROSWAP)?.value; 

    const horizonProps = {
      assetFrom: amountAsset.currency,
      assetTo: quoteAsset,
      amount,
      tradeType,
    };

    let horizonPath: BuildTradeRoute | undefined;
    if(isHorizonEnabled){
      horizonPath = (await getHorizonBestPath(horizonProps, sorobanContext)) as BuildTradeRoute;
    }
    
    let sorobanPath: BuildTradeRoute | undefined;
    if (isAggregator) {
      sorobanPath = (await router
        .routeSplit(currencyAmount, quoteCurrency, tradeType)
        .then((response) => {
          if (!response) return undefined;
          const result = {
            ...response,
            platform: PlatformType.AGGREGATOR,
          };
          return result;
        })) as BuildTradeRoute;
    } else if(isSoroswapEnabled){
      sorobanPath = (await router
        .route(currencyAmount, quoteCurrency, tradeType, factory, sorobanContext as any)
        .then((response) => {
          if (!response) return undefined;
          const result = {
            ...response,
            platform: PlatformType.ROUTER,
          };
          return result;
        })) as BuildTradeRoute;
    }

    const bestPath = getBestPath(horizonPath, sorobanPath, tradeType);

    return bestPath;
  };

  return { generateRoute, resetRouterSdkCache, maxHops };
};
// .then((res) => {
//   if (!res) return;
//   const response = {
//     ...res,
//     platform: PlatformType.ROUTER,
//   };
//   return response;
// });
