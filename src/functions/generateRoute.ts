import { useSorobanReact } from '@soroban-react/core';
import { AppContext } from 'contexts';
import { useFactory } from 'hooks';
import { useContext, useMemo } from 'react';
import { fetchAllSoroswapPairs } from 'services/pairs';
import { CurrencyAmount, Networks, Protocols, Router, Token, TradeType } from 'soroswap-router-sdk';

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

export const useRouterSDK = () => {
  const sorobanContext = useSorobanReact();
  const { factory } = useFactory(sorobanContext);

  const { Settings } = useContext(AppContext);
  const { maxHops } = Settings;

  const network = sorobanContext.activeChain?.networkPassphrase as Networks;

  const router = useMemo(() => {
    return new Router({
      getPairsFn: async () => {
        const data = await fetchAllSoroswapPairs(network);

        return data;
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
    amountTokenAddress,
    quoteTokenAddress,
    amount,
    tradeType,
  }: GenerateRouteProps) => {
    if (!factory) throw new Error('Factory address not found');
    const currencyAmount = fromAddressAndAmountToCurrencyAmount(amountTokenAddress, amount);
    const quoteCurrency = fromAddressToToken(quoteTokenAddress);

    return router.route(currencyAmount, quoteCurrency, tradeType, factory, sorobanContext as any);
  };

  const generateDexDistribution = async ({
    amountTokenAddress,
    quoteTokenAddress,
    amount,
    tradeType,
  }: GenerateRouteProps) => {
    if (!factory) throw new Error('Factory address not found');
    const currencyAmount = fromAddressAndAmountToCurrencyAmount(amountTokenAddress, amount);
    const quoteCurrency = fromAddressToToken(quoteTokenAddress);

    return router.routeSplit(currencyAmount, quoteCurrency, tradeType);
  };

  return { generateRoute, generateDexDistribution, resetRouterSdkCache, maxHops };
};
