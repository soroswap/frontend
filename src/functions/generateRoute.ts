import { useSorobanReact } from '@soroban-react/core';
import { useFactory } from 'hooks';
import { useContext, useMemo } from 'react';
import { CurrencyAmount, Networks, Protocols, Router, Token, TradeType } from 'soroswap-router-sdk';
import { AppContext } from 'contexts';
import axios from 'axios';

const backendUrl = process.env.NEXT_PUBLIC_SOROSWAP_BACKEND_URL;
const backendApiKey = process.env.NEXT_PUBLIC_SOROSWAP_BACKEND_API_KEY;

export interface GenerateRouteProps {
  amountTokenAddress: string;
  quoteTokenAddress: string;
  amount: string;
  tradeType: TradeType;
}

const queryNetworkDict: { [x: string]: 'mainnet' | 'testnet' } = {
  [Networks.PUBLIC]: 'mainnet',
  [Networks.TESTNET]: 'testnet',
};

export const useRouterSDK = () => {
  const sorobanContext = useSorobanReact();
  const { factory } = useFactory(sorobanContext);

  const { Settings } = useContext(AppContext);
  const { maxHops } = Settings;

  const network = sorobanContext.activeChain?.networkPassphrase as Networks;

  const router = useMemo(() => {
    if (!backendUrl || !backendApiKey) {
      throw new Error(
        'NEXT_PUBLIC_SOROSWAP_BACKEND_URL and NEXT_PUBLIC_SOROSWAP_BACKEND_API_KEY must be set in the environment variables.',
      );
    }

    return new Router({
      getPairsFn: async () => {
        let queryNetwork = queryNetworkDict[network];

        const { data } = await axios.get('/api/pairs', {
          params: { network: queryNetwork },
        });

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

  return { generateRoute, resetRouterSdkCache, maxHops };
};
