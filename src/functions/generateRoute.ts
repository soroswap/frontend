import { useSorobanReact } from '@soroban-react/core';
import { Networks, CurrencyAmount, Router, Token, TradeType, Protocols } from 'soroswap-router-sdk';
import { useFactory } from 'hooks';
import { useMemo } from 'react';

const backendUrl = process.env.NEXT_PUBLIC_SOROSWAP_BACKEND_URL;
const apiKey = process.env.NEXT_PUBLIC_SOROSWAP_BACKEND_API_KEY;

export interface GenerateRouteProps {
  amountTokenAddress: string;
  quoteTokenAddress: string;
  amount: string;
  tradeType: TradeType;
}

const chainNameToId: { [x: string]: Networks } = {
  testnet: Networks.TESTNET,
  standalone: Networks.STANDALONE,
  futurenet: Networks.FUTURENET,
};

export const useRouterSDK = () => {
  const sorobanContext = useSorobanReact();
  const { factory } = useFactory(sorobanContext);

  const network: Networks =
    chainNameToId[sorobanContext.activeChain?.network?.toLowerCase() ?? 'testnet'];

  const router = useMemo(() => {
    if (!backendUrl || !apiKey) {
      throw new Error(
        'NEXT_PUBLIC_SOROSWAP_BACKEND_URL and NEXT_PUBLIC_SOROSWAP_BACKEND_API_KEY must be set in the environment variables.',
      );
    }

    return new Router(backendUrl, apiKey, 60, [Protocols.SOROSWAP], network);
  }, [network]);

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
    if (!factory.factory_address) throw new Error('Factory address not found');

    const currencyAmount = fromAddressAndAmountToCurrencyAmount(amountTokenAddress, amount);
    const quoteCurrency = fromAddressToToken(quoteTokenAddress);

    return router.route(
      currencyAmount,
      quoteCurrency,
      tradeType,
      factory.factory_address,
      sorobanContext,
    );
  };

  return { generateRoute, resetRouterSdkCache };
};
