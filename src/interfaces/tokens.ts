export interface TokenType {
  token_id: string;
  token_address: string;
  token_name: string;
  token_symbol: string;
}

export interface tokensResponse {
  network: string;
  tokens: TokenType[];
}

export type TokenMapType = {
  [key: string]: TokenType;
};

export type TokenBalancesMap = {
  [tokenAddress: string]: { usdValue: number; balance: string };
};

export interface Price {
  quoteCurrency: TokenType;
  baseCurrency: TokenType;
  price: string;
}
