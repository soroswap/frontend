import { useSorobanReact } from '@soroban-react/core';
import { AppContext } from 'contexts';
import { useFactory } from 'hooks';
import { useAggregator } from 'hooks/useAggregator';
import { useContext, useMemo } from 'react';
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
  const { maxHops } = Settings;

  const network = sorobanContext.activeChain?.networkPassphrase as Networks;

  const router = useMemo(() => {
    const protocols = [Protocols.SOROSWAP];

    if (isAggregator) protocols.push(Protocols.PHOENIX);

    return new Router({
      getPairsFns: shouldUseBackend
        ? [
            {
              protocol: Protocols.SOROSWAP,
              fn: async () => fetchAllSoroswapPairs(network),
            },
            {
              protocol: Protocols.PHOENIX,
              fn: async () => fetchAllPhoenixPairs(network),
            },
          ]
        : undefined,
      pairsCacheInSeconds: 60,
      protocols: protocols,
      network,
      maxHops,
    });
  }, [network, maxHops, isAggregator]);

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
  }: GenerateRouteProps) => {
    if (!factory) throw new Error('Factory address not found');
    const currencyAmount = fromAddressAndAmountToCurrencyAmount(
      amountAsset.currency.contract,
      amount,
    );
    const quoteCurrency = fromAddressToToken(quoteAsset.contract);

    const horizonProps = {
      assetFrom: amountAsset.currency,
      assetTo: quoteAsset,
      amount,
      tradeType,
    };

    const horizonPath: BuildTradeRoute | undefined = await getHorizonBestPath(
      horizonProps,
      sorobanContext,
    );

    let sorobanPath;

    if (isAggregator) {
      // console.log('Returning routeSplit');
      // console.log(await router.routeSplit(currencyAmount, quoteCurrency, tradeType));
      sorobanPath = await router.routeSplit(currencyAmount, quoteCurrency, tradeType);
      sorobanPath = { ...sorobanPath, platform: PlatformType.AGGREGATOR };
    } else {
      sorobanPath = await router.route(
        currencyAmount,
        quoteCurrency,
        tradeType,
        factory,
        sorobanContext as any,
      );
      sorobanPath = { ...sorobanPath, platform: PlatformType.AGGREGATOR };
    }

    const bestPath = getBestPath(horizonPath!, sorobanPath!, tradeType);

    // .then((res) => {
    //   if (!res) return;
    //   const response = {
    //     ...res,
    //     platform: PlatformType.ROUTER,
    //   };
    //   return response;
    // });

    return bestPath;
  };

  return { generateRoute, resetRouterSdkCache, maxHops };
};
