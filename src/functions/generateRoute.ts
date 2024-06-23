import { useSorobanReact } from '@soroban-react/core';
import { AppContext } from 'contexts';
import { useFactory } from 'hooks';
import { useContext, useMemo } from 'react';
import { CurrencyAmount, Networks, Protocols, Router, Token, TradeType } from 'soroswap-router-sdk';
import { fetchAllPhoenixPairs, fetchAllSoroswapPairs } from 'services/pairs';

export interface GenerateRouteProps {
  amountTokenAddress: string;
  quoteTokenAddress: string;
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

  const { Settings } = useContext(AppContext);
  const { maxHops } = Settings;

  const network = sorobanContext.activeChain?.networkPassphrase as Networks;

  const isAggregator = sorobanContext?.activeChain?.id == 'testnet' ? true : false;

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
    amountTokenAddress,
    quoteTokenAddress,
    amount,
    tradeType,
  }: GenerateRouteProps) => {
    if (!factory) throw new Error('Factory address not found');
    const currencyAmount = fromAddressAndAmountToCurrencyAmount(amountTokenAddress, amount);
    const quoteCurrency = fromAddressToToken(quoteTokenAddress);

    if (isAggregator) {
      return router.routeSplit(currencyAmount, quoteCurrency, tradeType);
    }

    return router.route(currencyAmount, quoteCurrency, tradeType, factory, sorobanContext as any);
  };

  return { generateRoute, resetRouterSdkCache, maxHops };
};
