import BigNumber from 'bignumber.js';
import { ChainId, CurrencyAmount, Router, Token } from 'soroswap-router-sdk';
import { InterfaceTrade, TradeType } from 'state/routing/types';

const backendUrl = process.env.NEXT_PUBLIC_SOROSWAP_BACKEND_URL;
const apiKey = process.env.NEXT_PUBLIC_SOROSWAP_BACKEND_API_KEY;

export interface GenerateRouteProps {
  amountTokenAddress: string;
  quoteTokenAddress: string;
  amount: string;
  tradeType: TradeType;
}

export const fromTradeToRouterSdkParams = (
  trade: InterfaceTrade | undefined,
): GenerateRouteProps | null => {
  if (trade?.tradeType === TradeType.EXACT_INPUT) {
    return {
      amountTokenAddress: trade.inputAmount?.currency.address as string,
      quoteTokenAddress: trade.outputAmount?.currency.address as string,
      amount: BigNumber(trade.inputAmount?.value!).toString(),
      tradeType: TradeType.EXACT_INPUT,
    };
  }
  if (trade?.tradeType === TradeType.EXACT_OUTPUT) {
    return {
      amountTokenAddress: trade.outputAmount?.currency.address as string,
      quoteTokenAddress: trade.inputAmount?.currency.address as string,
      amount: BigNumber(trade.outputAmount?.value!).toString(),
      tradeType: TradeType.EXACT_OUTPUT,
    };
  }
  return null;
};

const fromAddressToToken = (address: string) => {
  return new Token(ChainId.TESTNET, address, 18);
};

const fromAddressAndAmountToCurrencyAmount = (address: string, amount: string) => {
  const token = fromAddressToToken(address);
  return CurrencyAmount.fromRawAmount(token, amount);
};

export const generateRoute = async ({
  amountTokenAddress,
  quoteTokenAddress,
  amount,
  tradeType,
}: GenerateRouteProps) => {
  if (!backendUrl || !apiKey) {
    throw new Error(
      'NEXT_PUBLIC_SOROSWAP_BACKEND_URL and NEXT_PUBLIC_SOROSWAP_BACKEND_API_KEY must be set in the environment variables.',
    );
  }

  const currencyAmount = fromAddressAndAmountToCurrencyAmount(amountTokenAddress, amount);
  const quoteCurrency = fromAddressToToken(quoteTokenAddress);

  const router = new Router(backendUrl, apiKey);

  return router.route(currencyAmount, quoteCurrency, tradeType);
};
