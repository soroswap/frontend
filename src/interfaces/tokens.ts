export interface TokenType {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
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
