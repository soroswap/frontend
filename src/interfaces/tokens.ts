export interface TokenType {
  issuer?: string;
  contract: string;
  name: string;
  code: string;
  decimals?: number;
  logoURI?: string;
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
