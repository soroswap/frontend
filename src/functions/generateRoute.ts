import { useSorobanReact } from 'stellar-react';
import { AppContext, ProtocolsStatus } from 'contexts';
import { useFactory } from 'hooks';
import { useAggregator } from 'hooks/useAggregator';
import { useContext, useEffect, useMemo } from 'react';
import { fetchAllPhoenixPairs, fetchAllSoroswapPairs } from 'services/pairs';
import {
  Currency,
  CurrencyAmount,
  Networks,
  Percent,
  Protocol,
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
import { fetchFactory } from 'services/factory';
import { contractInvoke } from 'stellar-react';
import { reservesBNWithTokens } from 'hooks/useReserves';
import { getPairAddress } from './getPairAddress';
import BigNumber from 'bignumber.js';
import { getExpectedAmount } from './getExpectedAmount';

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
  currentProtocolsStatus: ProtocolsStatus[];
}

const queryNetworkDict: { [x: string]: 'MAINNET' | 'TESTNET' } = {
  [Networks.PUBLIC]: 'MAINNET',
  [Networks.TESTNET]: 'TESTNET',
};

const shouldUseBackend = process.env.NEXT_PUBLIC_SOROSWAP_BACKEND_ENABLED === 'true';
const shouldUseDirectPath = process.env.NEXT_PUBLIC_DIRECT_PATH_ENABLED === 'true';

export const useRouterSDK = () => {
  const sorobanContext = useSorobanReact();
  const { factory } = useFactory(sorobanContext);
  const { isEnabled: isAggregator } = useAggregator();

  const { Settings } = useContext(AppContext);
  const { maxHops, protocolsStatus, setProtocolsStatus } = Settings;

  const network = sorobanContext.activeChain?.networkPassphrase as Networks;

  const getPairsFns = useMemo(() => {
    const routerProtocols = []
    if (shouldUseBackend) return undefined
    //  here you should add your new supported aggregator protocols
    for (let protocol of protocolsStatus) {
      if (protocol.key === Protocol.SOROSWAP && protocol.value === true) {
        routerProtocols.push({ protocol: Protocol.SOROSWAP, fn: async () => fetchAllSoroswapPairs(network) });
      }
      if (protocol.key === Protocol.PHOENIX && protocol.value === true) {
        routerProtocols.push({ protocol: Protocol.PHOENIX, fn: async () => fetchAllPhoenixPairs(network) });
      }
    }
    return routerProtocols;
  }, [network, protocolsStatus]);

  const getProtocols = useMemo(() => {
    const newProtocols = [];
    for (let protocol of protocolsStatus) {
      if (protocol.key != PlatformType.STELLAR_CLASSIC && protocol.value === true) {
        newProtocols.push(protocol.key);
      }
    }
    return newProtocols as Protocol[];
  }, [protocolsStatus]);

  const router = useMemo(() => {
    return new Router({
      getPairsFns: getPairsFns,
      pairsCacheInSeconds: 5,
      protocols: getProtocols,
      network,
      maxHops,
    });
  }, [network, maxHops, isAggregator, protocolsStatus]);

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
    if (shouldUseDirectPath) {
      try {
        // get pair address from factory
        const pairAddress = await getPairAddress(amountAsset.currency.contract, quoteAsset.contract, sorobanContext);

        // Get reserves from pair
        const reserves = await reservesBNWithTokens(pairAddress, sorobanContext);
        if (!reserves?.reserve0 || !reserves?.reserve1) {
          throw new Error('Reserves not found');
        }

        // Get amountOut or amountIn from reserves and tradeType
        let quoteAmount = await getExpectedAmount(
          amountAsset.currency,
          quoteAsset,
          new BigNumber(amount),
          sorobanContext,
          tradeType
        );

        // Convert from lumens to stroops (multiply by 10^7)
        quoteAmount = quoteAmount.integerValue();

        return {
          amountCurrency: amountAsset,
          quoteCurrency: CurrencyAmount.fromRawAmount(fromAddressToToken(quoteAsset.contract), quoteAmount.toString()),
          tradeType,
          trade: {
            amountIn: tradeType === TradeType.EXACT_INPUT ? amount : quoteAmount.toString(),
            amountInMax: tradeType === TradeType.EXACT_OUTPUT ? quoteAmount.toString() : undefined,
            amountOut: tradeType === TradeType.EXACT_INPUT ? quoteAmount.toString() : amount,
            amountOutMin: tradeType === TradeType.EXACT_INPUT ? quoteAmount.toString() : undefined,
            path: tradeType === TradeType.EXACT_INPUT ? [amountAsset.currency.contract, quoteAsset.contract] : [quoteAsset.contract, amountAsset.currency.contract],
          },
          priceImpact: new Percent('0'),
          platform: PlatformType.ROUTER,
        } as BuildTradeRoute;
      } catch (error) {
        console.error('Error generating direct path:', error);
        throw error;
      }
    }
    if (!factory) throw new Error('Factory address not found');
    const currencyAmount = fromAddressAndAmountToCurrencyAmount(
      amountAsset.currency.contract,
      amount,
    );
    const quoteCurrency = fromAddressToToken(quoteAsset.contract);

    const isHorizonEnabled = currentProtocolsStatus.find((p) => p.key === PlatformType.STELLAR_CLASSIC)?.value;

    const isSoroswapEnabled = currentProtocolsStatus.find((p) => p.key === Protocol.SOROSWAP)?.value;

    const horizonProps = {
      assetFrom: amountAsset.currency,
      assetTo: quoteAsset,
      amount,
      tradeType,
    };

    let horizonPath: BuildTradeRoute | undefined;
    if (isHorizonEnabled) {
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
            quoteCurrency: CurrencyAmount.fromRawAmount(quoteCurrency, '0')
          } as BuildTradeRoute;
          return result;
        }).catch((e) => {
          console.error('error while generating soroban path:', e);
          return undefined;
        })) as BuildTradeRoute | undefined;
    } else if (isSoroswapEnabled) {
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
