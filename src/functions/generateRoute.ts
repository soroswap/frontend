import {
  ChainId,
  CurrencyAmount,
  Router,
  Token,
  TradeType as SdkTradeType,
  Protocols,
} from 'soroswap-router-sdk';

const backendUrl = process.env.NEXT_PUBLIC_SOROSWAP_BACKEND_URL;
const apiKey = process.env.NEXT_PUBLIC_SOROSWAP_BACKEND_API_KEY;

const router = new Router(backendUrl!, apiKey!, 60, [Protocols.SOROSWAP]);

export interface GenerateRouteProps {
  amountTokenAddress: string;
  quoteTokenAddress: string;
  amount: string;
  tradeType: SdkTradeType;
}

const fromAddressToToken = (address: string) => {
  return new Token(ChainId.TESTNET, address, 18);
};

const fromAddressAndAmountToCurrencyAmount = (address: string, amount: string) => {
  const token = fromAddressToToken(address);
  return CurrencyAmount.fromRawAmount(token, amount);
};

export const resetRouterSdkCache = () => {
  router.resetCache();
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

  return router.route(currencyAmount, quoteCurrency, tradeType);
};
