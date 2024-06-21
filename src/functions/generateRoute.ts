import { useSorobanReact } from '@soroban-react/core';
import { useFactory } from 'hooks';
import { useContext, useMemo } from 'react';
import { Currency, CurrencyAmount, Networks, Percent, Protocols, Route, Router, Token, TradeType } from 'soroswap-router-sdk';
import { AppContext } from 'contexts';
import axios from 'axios';
import { TokenType } from 'interfaces';
import { getBestPath, getHorizonBestPath } from 'helpers/horizon/getHorizonPath';
import { PlatformType } from 'state/routing/types';
import { CurrencyAmount as AmountAsset } from 'interfaces';

export interface BuildTradeRoute {
  amountCurrency: AmountAsset | CurrencyAmount<Currency>;
  quoteCurrency: AmountAsset | CurrencyAmount<Currency>;
  tradeType: TradeType;
  routeCurrency: any[] | Route<Currency, Currency>;
  trade: {
      amountIn?: string;
      amountOut?: string;
      amountOutMin?: string;
      amountInMax?: string;
      path: string[];
  };
  priceImpact: Percent;
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

export const useRouterSDK = () => {
  const sorobanContext = useSorobanReact();
  const { factory } = useFactory(sorobanContext);

  const { Settings } = useContext(AppContext);
  const { maxHops } = Settings;

  const network = sorobanContext.activeChain?.networkPassphrase as Networks;

  const router = useMemo(() => {
    return new Router({
      getPairsFn: async () => {
        let queryNetwork = queryNetworkDict[network];

        const { data } = await axios.get<
          {
            tokenA: TokenType;
            tokenB: TokenType;
            reserveA: string;
            reserveB: string;
          }[]
        >('https://info.soroswap.finance/api/pairs', {
          params: { network: queryNetwork },
        });

        return data.map((pair) => {
          return {
            tokenA: pair.tokenA.contract,
            tokenB: pair.tokenB.contract,
            reserveA: pair.reserveA,
            reserveB: pair.reserveB,
          };
        });
      },
      pairsCacheInSeconds: 60,
      protocols: [Protocols.SOROSWAP],
      network,
      maxHops,
    });
  }, [network, maxHops]);

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
    const currencyAmount = fromAddressAndAmountToCurrencyAmount(amountAsset.currency.contract, amount);
    const quoteCurrency = fromAddressToToken(quoteAsset.contract);

    const horizonProps = {
      assetFrom: amountAsset.currency,
      assetTo: quoteAsset,
      amount,
      tradeType,
    };

    const horizonPath: BuildTradeRoute | undefined = await getHorizonBestPath(horizonProps, sorobanContext);
    const routerPath: BuildTradeRoute | undefined = await router.route(currencyAmount, quoteCurrency, tradeType, factory, sorobanContext as any).then(res=>{
      if(!res) return;
      const response = {
        ...res,
        platform: PlatformType.SOROBAN,
      }
      return response;
    })

    const bestPath = getBestPath(horizonPath!, routerPath!, tradeType);

    return bestPath;
  };

  return { generateRoute, resetRouterSdkCache, maxHops };
};
